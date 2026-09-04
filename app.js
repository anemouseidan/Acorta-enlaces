// ---------- Elementos ----------
const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const form = document.getElementById('form');
const urlInput = document.getElementById('url-input');
const submitBtn = form.querySelector('button');
const resultBox = document.getElementById('result');
const resultInput = document.getElementById('result-input');
const copyBtn = document.getElementById('copy-btn');
const errorEl = document.getElementById('error');

const historyBody = document.getElementById('history-body');
const historyEmpty = document.getElementById('history-empty');

// ---------- Sesión ----------
async function checkSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    loginView.classList.add('hidden');
    appView.classList.remove('hidden');
    loadHistory();
  } else {
    loginView.classList.remove('hidden');
    appView.classList.add('hidden');
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.add('hidden');
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    loginError.textContent = 'Correo o contraseña incorrectos.';
    loginError.classList.remove('hidden');
    return;
  }
  checkSession();
});

logoutBtn.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  checkSession();
});

// ---------- Utilidades ----------
function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function randomCode(length = 6) {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O/1/l/I
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
}

// Envuelve el link interno con un alias externo gratuito (oculta la URL de GitHub
// en el link que compartes; no oculta el destino final tras el clic, ver README).
async function wrapExternally(longUrl) {
  try {
    const res = await fetch('https://cleanuri.com/api/v1/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: longUrl }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result_url || null;
  } catch {
    return null;
  }
}

// ---------- Crear enlace ----------
async function createShortLink(targetUrl, userId, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const code = randomCode();
    const { error } = await supabaseClient.from('links').insert({ code, target: targetUrl, user_id: userId });
    if (!error) return code;
    if (error.code !== '23505') throw error; // 23505 = codigo duplicado, cualquier otro error se propaga
  }
  throw new Error('No se pudo generar un codigo unico, intenta de nuevo.');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.classList.add('hidden');
  resultBox.classList.add('hidden');

  const url = urlInput.value.trim();
  if (!isValidUrl(url)) {
    return showError('La URL no es valida. Debe incluir http:// o https://');
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Generando...';

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const code = await createShortLink(url, session.user.id);
    const base = `${location.origin}${location.pathname.replace('index.html', '')}`;
    const internalUrl = `${base}wait.html?c=${code}`;

    const externalUrl = await wrapExternally(internalUrl);
    resultInput.value = externalUrl || internalUrl;
    resultBox.classList.remove('hidden');

    if (!externalUrl) {
      showError('El alias externo no esta disponible ahora mismo; se muestra el link normal (funciona igual).');
    }

    urlInput.value = '';
    loadHistory();
  } catch (err) {
    showError(err.message || 'No se pudo conectar con la base de datos.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Generar';
  }
});

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(resultInput.value);
  copyBtn.textContent = 'Copiado';
  setTimeout(() => (copyBtn.textContent = 'Copiar'), 1500);
});

// ---------- Historial ----------
async function loadHistory() {
  const { data, error } = await supabaseClient
    .from('links')
    .select('code, target, clicks, created_at')
    .order('created_at', { ascending: false });

  historyBody.innerHTML = '';

  if (error || !data || data.length === 0) {
    historyEmpty.classList.remove('hidden');
    return;
  }
  historyEmpty.classList.add('hidden');

  data.forEach((row) => {
    const tr = document.createElement('tr');

    const tdTarget = document.createElement('td');
    tdTarget.className = 'truncate';
    tdTarget.title = row.target;
    tdTarget.textContent = row.target;

    const tdClicks = document.createElement('td');
    tdClicks.textContent = row.clicks;

    const tdDate = document.createElement('td');
    tdDate.textContent = new Date(row.created_at).toLocaleDateString();

    const tdActions = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.className = 'ghost-btn small';
    delBtn.textContent = 'Borrar';
    delBtn.addEventListener('click', () => deleteLink(row.code));
    tdActions.appendChild(delBtn);

    tr.append(tdTarget, tdClicks, tdDate, tdActions);
    historyBody.appendChild(tr);
  });
}

async function deleteLink(code) {
  if (!confirm('¿Borrar este enlace? Dejará de funcionar.')) return;
  await supabaseClient.from('links').delete().eq('code', code);
  loadHistory();
}

// ---------- Arranque ----------
checkSession();
