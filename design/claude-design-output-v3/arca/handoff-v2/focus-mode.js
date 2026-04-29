/* ============================================================
 * Arca v2 — Focus Mode Lock controller
 *
 * Public API:
 *   FocusLock.enter({ minutes, taskName })
 *   FocusLock.exit()
 *
 * Wire the existing #focusModeBtn to FocusLock.enter().
 * Esc, click, or any keypress exits.
 * ============================================================ */

const FocusLock = (() => {
  const el = () => document.getElementById('focusLock');
  let interval = null;
  let endTs = 0;

  function fmt(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function tick() {
    const node = el();
    if (!node) return;
    const remaining = Math.max(0, (endTs - Date.now()) / 1000);
    const total = Number(node.dataset.totalSeconds || 1500);
    const elapsed = total - remaining;

    node.querySelector('#focusLockTimer').textContent      = fmt(elapsed);
    node.querySelector('#focusLockRemaining').textContent  = `${fmt(remaining)} remaining`;
    node.querySelector('#focusLockProgress').style.width   = `${(elapsed / total) * 100}%`;

    if (remaining <= 0) {
      exit();
      // Hand off to the session-closed beat
      window.dispatchEvent(new CustomEvent('arca:session-closed', {
        detail: { duration: fmt(total) },
      }));
    }
  }

  function enter({ minutes = 25, taskName = '' } = {}) {
    const node = el();
    if (!node) return;

    const totalSeconds = minutes * 60;
    node.dataset.totalSeconds = String(totalSeconds);
    endTs = Date.now() + totalSeconds * 1000;

    node.querySelector('#focusLockTask').textContent  = taskName;
    node.querySelector('#focusLockTimer').textContent = '00:00';
    node.querySelector('#focusLockRemaining').textContent = `${fmt(totalSeconds)} remaining`;

    node.dataset.active = 'true';
    interval = setInterval(tick, 250);
    tick();

    document.addEventListener('keydown', onKey);
  }

  function exit() {
    const node = el();
    if (!node) return;
    node.dataset.active = 'false';
    clearInterval(interval);
    interval = null;
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') exit();
  }

  return { enter, exit };
})();

window.FocusLock = FocusLock;
