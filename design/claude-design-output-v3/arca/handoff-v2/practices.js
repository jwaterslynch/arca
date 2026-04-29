/* ============================================================
 * Arca v2 — Practices panel interactions
 * Wire to your existing data layer. Two events emitted:
 *   - 'arca:practice-tick'   { id, ticked }
 *   - 'arca:practice-expand' { id, expanded }
 * Listen for these in your existing habit-store code.
 * ============================================================ */

(function initPractices() {
  const panel = document.querySelector('.practices-panel');
  if (!panel) return;

  panel.addEventListener('click', (e) => {
    const row = e.target.closest('.practice-row');
    if (!row) return;
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;

    const id = row.dataset.practiceId;

    if (action === 'tick') {
      const next = row.dataset.ticked !== 'true';
      row.dataset.ticked = String(next);
      panel.dispatchEvent(new CustomEvent('arca:practice-tick', {
        bubbles: true,
        detail: { id, ticked: next },
      }));
      updateCount();
      return;
    }

    if (action === 'expand') {
      const next = row.dataset.expanded !== 'true';
      // Close any other open drawer (one at a time)
      panel.querySelectorAll('.practice-row[data-expanded="true"]').forEach(r => {
        if (r !== row) r.dataset.expanded = 'false';
      });
      row.dataset.expanded = String(next);
      panel.dispatchEvent(new CustomEvent('arca:practice-expand', {
        bubbles: true,
        detail: { id, expanded: next },
      }));
      return;
    }
  });

  // Keyboard: Enter on row label = expand; Space on tick = tick (native button behavior covers this)
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      panel.querySelectorAll('.practice-row[data-expanded="true"]').forEach(r => {
        r.dataset.expanded = 'false';
      });
    }
  });

  function updateCount() {
    const total = panel.querySelectorAll('.practice-row').length;
    const ticked = panel.querySelectorAll('.practice-row[data-ticked="true"]').length;
    const el = panel.querySelector('#practicesCount');
    if (el) el.textContent = `${ticked} of ${total}`;
  }
})();
