/* ============================================================
 * Arca v2 — Session Closed Beat controller
 *
 * Listens for `arca:session-closed` events and plays the 1.4s
 * beat. Any keypress or mousedown skips early.
 * ============================================================ */

(function initSessionBeat() {
  const el = document.getElementById('sessionBeat');
  if (!el) return;

  let timer = null;
  const meta = el.querySelector('#sessionBeatMeta');

  function play({ duration = '25:00' } = {}) {
    if (meta) meta.textContent = `${duration} · session closed`;

    // Restart animation: toggle off → reflow → on
    el.dataset.active = 'false';
    void el.offsetWidth; // force reflow
    el.dataset.active = 'true';

    clearTimeout(timer);
    timer = setTimeout(end, 1400);

    document.addEventListener('keydown', skip, { once: true });
    document.addEventListener('mousedown', skip, { once: true });
  }

  function end() {
    el.dataset.active = 'false';
    clearTimeout(timer);
    document.removeEventListener('keydown', skip);
    document.removeEventListener('mousedown', skip);
  }

  function skip() { end(); }

  window.addEventListener('arca:session-closed', (e) => play(e.detail || {}));
})();
