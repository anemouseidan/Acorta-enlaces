const params = new URLSearchParams(location.search);
const code = params.get('c');

const countdownText = document.getElementById('countdown-text');
const invalidEl = document.getElementById('invalid');
const actionBar = document.getElementById('action-bar');
const adblockWarning = document.getElementById('adblock-warning');

async function resolveTarget(shortCode) {
  const { data, error } = await supabaseClient.rpc('get_target', { p_code: shortCode });
  if (error || !data) return null;
  return data;
}

// Detecta bloqueadores de anuncios con un elemento "cebo" que ellos
// suelen ocultar o eliminar (nombres de clase que sus listas de filtro
// reconocen). Si el navegador lo esconde, asumimos que hay un bloqueador.
function detectAdBlock() {
  return new Promise((resolve) => {
    const bait = document.createElement('div');
    bait.className = 'ad-banner ads adsbox ad-placement pub_300x250';
    bait.style.cssText = 'position:absolute; left:-9999px; top:-9999px; width:1px; height:1px;';
    document.body.appendChild(bait);

    setTimeout(() => {
      const blocked =
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        bait.offsetWidth === 0 ||
        getComputedStyle(bait).display === 'none' ||
        getComputedStyle(bait).visibility === 'hidden';
      bait.remove();
      resolve(blocked);
    }, 200);
  });
}

function startCountdown(target) {
  let seconds = 5;
  const secondsEl = document.getElementById('seconds');
  const btn = document.getElementById('go-btn');

  const timer = setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      clearInterval(timer);
      countdownText.classList.add('hidden');
      btn.href = target;
      btn.classList.remove('hidden');
    } else {
      secondsEl.textContent = seconds;
    }
  }, 1000);
}

function showInvalid() {
  actionBar.classList.remove('hidden');
  countdownText.classList.add('hidden');
  invalidEl.classList.remove('hidden');
}

function showAdblockWarning() {
  adblockWarning.classList.remove('hidden');
  // La barra de acción y el contador nunca se muestran mientras haya bloqueador
}

(async () => {
  if (!code) return showInvalid();
  const target = await resolveTarget(code);
  if (!target) return showInvalid();

  const blocked = await detectAdBlock();
  if (blocked) return showAdblockWarning();

  // El clic ya cuenta como "visita real" al llegar a la página de espera
  supabaseClient.rpc('increment_clicks', { p_code: code });

  actionBar.classList.remove('hidden');
  startCountdown(target);
})();
