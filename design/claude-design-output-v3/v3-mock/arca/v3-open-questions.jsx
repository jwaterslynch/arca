// Arca v3 — Open questions for engineering

function OpenQuestionsV3() {
  const qs = [
    {
      area: 'Practices data',
      q: 'How is "stale" defined?',
      detail: 'The rail can show a faint warning ring on dots that are 3+ days hollow, but only if the backend tracks last-checked timestamps per practice. If practices are just booleans on a daily document, this needs a schema change. Is one in flight already?',
    },
    {
      area: 'Practices data',
      q: 'Are practices the same set every day, or per-day customizable?',
      detail: 'The rail assumes a stable count (~7 dots). If the user can add/remove practices day-by-day, the rail needs to handle 4-dot and 12-dot states gracefully. Drawer assumes the canonical set.',
    },
    {
      area: 'Focus mode',
      q: 'Where does the timer state live?',
      detail: 'v3 makes focus mode native — it owns elapsed/remaining locally. When the user exits, do we want that state to persist back to a server-side session log? If yes, the wire format and post-session sync flow needs spec\'ing. The mock fakes it with React state.',
    },
    {
      area: 'Focus mode',
      q: 'Multi-window behaviour?',
      detail: 'If a user opens Arca in two windows and enters focus on one, what should the other show? Lockout? Mirror? Independent? My instinct: mirror with read-only timer in the second window. Needs a product call.',
    },
    {
      area: 'AI bar',
      q: 'Streaming UI vs blocking UI?',
      detail: 'The mock shows a passive input. Real implementation: do we render token-by-token streaming inline in the list, or open a side modal for the response? Streaming inline preserves the calm flow but requires layout shift handling.',
    },
    {
      area: 'AI bar',
      q: 'What\'s the actual command surface?',
      detail: 'Placeholder reads "Capture, plan, or ask…" — implies three modes. Need to confirm: capture (creates task), plan (mutates list), ask (free-form). Auto-detect intent or explicit prefixes (/plan, /ask)?',
    },
    {
      area: 'Stats',
      q: 'Where do "deep ratio" and "closed this week" come from?',
      detail: 'Both are derived metrics. Deep ratio = (deep tasks closed) / (total tasks closed) over a window — but which window? Rolling 7d? Calendar week? Today? Same q for closed-this-week.',
    },
    {
      area: 'Streak',
      q: 'What breaks a streak?',
      detail: 'Skipping all 7 practices? 1+ practice tick on the day? Closing 1+ task? The number in the top bar implies a rule we haven\'t defined. If undefined, it will feel arbitrary the first time it resets to 0.',
    },
    {
      area: 'Drawer',
      q: 'Drawer or full-page modal for practice management?',
      detail: 'Mock uses a right-side drawer (~440px). If practice management gets richer (history charts, per-practice notes, weekly review), the drawer will feel cramped. Worth deciding now whether the drawer is a temporary stop or the long-term home.',
    },
    {
      area: 'Accessibility',
      q: 'Rail dots and screen readers',
      detail: 'Each dot needs an accessible label like "Read · 4 day streak · not done today". Tab order: rail before main? Skip-to-content link? Confirm with a11y audit before merge — visually-driven UI is easy to ship inaccessibly.',
    },
    {
      area: 'Performance',
      q: 'Focus mode mount cost',
      detail: 'v3 unmounts the Execute view when focus mode opens (in the mock — could be done with display:none instead). If the task list is hundreds of items, mount/unmount could feel laggy. Hide-don\'t-unmount is probably the right call. Confirm with eng.',
    },
    {
      area: 'Migration',
      q: 'Existing users on v2',
      detail: 'Practices currently render as a card with rows. Switching to a rail is a visible reshuffle. Worth a one-time onboarding tooltip ("Practices live up here now — click Manage for the full view") to avoid support tickets in week 1.',
    },
  ];

  return (
    <div style={{ width: 1024, padding: 56, background: 'var(--paper)', fontFamily: 'Inter', color: 'var(--ink)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-deep)', marginBottom: 8 }}>v3 · Open questions</div>
      <div className="display" style={{ fontSize: 32, letterSpacing: '-0.02em', marginBottom: 8, fontWeight: 500 }}>Things engineering needs to answer.</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 32, fontStyle: 'italic' }}>
        Visual mocks paper over real product decisions. Here are the ones I noticed making this. Most are 5-minute calls; a few may force a schema rethink.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
        {qs.map((q, i) => (
          <div key={i} style={{ background: 'var(--surface)', padding: '18px 24px', display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24, alignItems: 'baseline' }}>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-deep)' }}>{q.area}</div>
            <div>
              <div className="display" style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 6, fontWeight: 500 }}>{q.q}</div>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)' }}>{q.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { OpenQuestionsV3 });
