// Arca v3 — Considered & rejected page

function RejectedV3() {
  const items = [
    {
      name: 'Promote practices to their own tab',
      verdict: 'Rejected',
      reason: 'Loses the proximity. The point of practices on Execute is the cross-pollination: you tick a practice while looking at your task list, the surfaces inform each other. Move them and you get calmer Execute, but practices become a chore-list you avoid opening.',
    },
    {
      name: 'Hide practices entirely until completed-state',
      verdict: 'Rejected',
      reason: 'Removes the adherence pressure that makes them work. The rail-of-dots keeps the pressure but moves it from "loud panel" to "quiet legible glance." Better.',
    },
    {
      name: 'Keep two columns, just calm the right one',
      verdict: 'Rejected',
      reason: "What v2 effectively tried. Polish overrides on dense bones don't change the experience. The structural problem was the layout, not the rows.",
    },
    {
      name: 'Group headings (Life Practices vs Work Domains)',
      verdict: 'Removed',
      reason: 'The rail flattens this — a dot is a dot. Headings reappear in the management drawer where they aid scanning. The user-facing daily surface doesn\'t need the categorical hierarchy.',
    },
    {
      name: 'Four stat boxes at the top',
      verdict: 'Replaced',
      reason: 'Two of the four (Today, This Week) duplicate what the rail already shows. The remaining two (Deep Ratio, Closed Wk) compress to a slim footer line. If you want the cards back, Tweaks lets you flip statsMode to "cards".',
    },
    {
      name: 'DEEP / STRATEGIC tags on every task row',
      verdict: 'Hidden by default',
      reason: 'A small depth dot (deep = filled, shallow = faint) carries the signal at 5% of the visual weight. Tags appear on hover. Tweaks toggle restores always-on if you find users miss them.',
    },
    {
      name: 'A streak number in the top bar',
      verdict: 'Kept · with reservation',
      reason: 'Day 50 question: does "12 day streak" make you happy or anxious? I left it but with low contrast. Easy to remove via Tweaks if it ages badly.',
    },
    {
      name: 'AI bar as a floating composer',
      verdict: 'Available · not default',
      reason: 'Floating feels modern but it covers content. Above-the-list keeps it in flow with the surface. Tweaks lets you try floating; my pick is above-list.',
    },
    {
      name: 'Drag-reorder in the rail',
      verdict: 'Deferred',
      reason: 'Rail dots are too small for confident drag UX (especially on macOS trackpad). Drag-reorder lives in the drawer. Open question if users expect it on the rail anyway — see the questions page.',
    },
    {
      name: 'Per-practice color on the rail dots',
      verdict: 'Considered, rejected for now',
      reason: 'The data model already has per-practice color. Tempting. But seven multicolored dots reads as decorative; uniform bronze reads as one cohesive ground. Use the per-practice color in the drawer where it aids identification, keep the rail uniform.',
    },
  ];

  return (
    <div style={{ width: 1024, padding: 56, background: 'var(--paper)', fontFamily: 'Inter', color: 'var(--ink)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-deep)', marginBottom: 8 }}>v3 · Considered and rejected</div>
      <div className="display" style={{ fontSize: 32, letterSpacing: '-0.02em', marginBottom: 32, fontWeight: 500 }}>The cuts are as informative as the choices.</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
        {items.map((r, i) => (
          <div key={i} style={{ background: 'var(--surface)', padding: '18px 24px', display: 'grid', gridTemplateColumns: '240px 130px 1fr', gap: 24, alignItems: 'baseline' }}>
            <div className="display" style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{r.name}</div>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', letterSpacing: '0.14em', textTransform: 'uppercase',
              color: r.verdict.startsWith('Reject') || r.verdict === 'Removed' ? 'var(--danger)'
                   : r.verdict.startsWith('Defer') || r.verdict === 'Replaced' || r.verdict.startsWith('Hidden') ? 'var(--warn)'
                   : 'var(--accent-deep)' }}>
              {r.verdict}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)' }}>{r.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { RejectedV3 });
