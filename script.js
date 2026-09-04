const STORAGE_KEY = 'acortador_historial';

const form = document.getElementById('form');
const urlInput = document.getElementById('url-input');
const submitBtn = form.querySelector('button');
const resultBox = document.getElementById('result');
const resultInput = document.getElementById('result-input');
const copyBtn = document.getElementById('copy-btn');
const errorEl = document.getElementById('error');

const historyBody = document.getElementById('history-body');
const historyEmpty = document.getElementById('history-empty');

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

async function createShortLink(targetUrl, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const code = randomCode();
    const { error } = await supabaseClient.from('links').insert({ code, target: targetUrl });
    if (!error) return code;
    if (error.code !== '23505') throw error; // 23505 = codigo duplicado
  }
  throw new Error('No se pudo generar un codigo unico, intenta de nuevo.');
}

// ---------- Historial local (solo en este navegador) ----------
function getLocalHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveToLocalHistory(entry) {
  const list = getLocalHistory();
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

async function renderHistory() {
  const list = getLocalHistory();
  historyBody.innerHTML = '';

  if (list.length === 0) {
    historyEmpty.classList.remove('hidden');
    return;
  }
  historyEmpty.classList.add('hidden');

  for (const entry of list) {
    const { data: clicks } = await supabaseClient.rpc('get_clicks', { p_code: entry.code });

    const tr = document.createElement('tr');

    const tdTarget = document.createElement('td');
    tdTarget.className = 'truncate';
    tdTarget.title = entry.target;
    tdTarget.textContent = entry.target;

    const tdClicks = document.createElement('td');
    tdClicks.textContent = clicks ?? 0;

    const tdDate = document.createElement('td');
    tdDate.textContent = new Date(entry.createdAt).toLocaleDateString();

    tr.append(tdTarget, tdClicks, tdDate);
    historyBody.appendChild(tr);
  }
}

// ---------- Formulario ----------
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
    const code = await createShortLink(url);
    const base = `${location.origin}${location.pathname.replace('index.html', '')}`;
    const internalUrl = `${base}wait.html?c=${code}`;

    const externalUrl = await wrapExternally(internalUrl);
    resultInput.value = externalUrl || internalUrl;
    resultBox.classList.remove('hidden');

    if (!externalUrl) {
      showError('El alias externo no esta disponible ahora mismo; se muestra el link normal (funciona igual).');
    }

    saveToLocalHistory({ code, target: url, createdAt: new Date().toISOString() });
    urlInput.value = '';
    renderHistory();
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

renderHistory();
