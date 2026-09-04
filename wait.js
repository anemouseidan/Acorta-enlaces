const params = new URLSearchParams(location.search);
const code = params.get('c');

const countdownText = document.getElementById('countdown-text');
const invalidEl = document.getElementById('invalid');

async function resolveTarget(shortCode) {
  const { data, error } = await supabaseClient.rpc('get_target', { p_code: shortCode });
  if (error || !data) return null;
  return data;
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
  countdownText.classList.add('hidden');
  invalidEl.classList.remove('hidden');
}

(async () => {
  if (!code) return showInvalid();
  const target = await resolveTarget(code);
  if (!target) return showInvalid();

  // El clic ya cuenta como "visita real" al llegar a la página de espera
  supabaseClient.rpc('increment_clicks', { p_code: code });

  startCountdown(target);
})();
