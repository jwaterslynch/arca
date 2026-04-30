// Arca v3 — Rationale page

function RationaleV3() {
  return (
    <div style={{ width: 1024, padding: 56, background: 'var(--paper)', fontFamily: 'Inter', color: 'var(--ink)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-deep)', marginBottom: 8 }}>v3 · Rationale</div>
      <div className="display" style={{ fontSize: 36, letterSpacing: '-0.02em', marginBottom: 8, fontWeight: 500 }}>The tension was the wrong frame.</div>
      <div className="display" style={{ fontSize: 18, color: 'var(--text-2)', fontWeight: 400, marginBottom: 32, fontStyle: 'italic' }}>
        Figure and ground, not visibility and elegance.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 12 }}>The reframe</div>
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: '0 0 12px' }}>
            The brief asked us to choose between adherence pressure and calm. That's a false choice — what you can't have is <strong>two surfaces both demanding active attention</strong>.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: '0 0 12px' }}>
            Tasks are the figure. Practices are the ground. The figure gets the active center: hero timer, AI bar, the list. The ground sits at the edge — present, legible, undeniable, but not loud.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>
            A rail of seven dots at the top of the screen <em>is</em> adherence pressure. Glance up: 4 of 7 today, three still hollow. That's the nudge — concentrated, calm.
          </p>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 12 }}>What this unlocks</div>
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: '0 0 12px' }}>
            The right rail is gone. The Execute view is now <strong>single-column, narrow, vertical</strong> — like the iOS app. Wider focus area. Real breathing room.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: '0 0 12px' }}>
            Stats collapsed to one slim line at the bottom. AI bar moved between hero and list — where you're already typing. Today reads like a notebook page, not a Jira board.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>
            Focus mode is now <strong>native</strong> — owns its own timer state, doesn't mirror the hero. One source of truth, one component to maintain.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 40, padding: '24px 28px', background: 'var(--surface)', borderLeft: '3px solid var(--accent)', borderRadius: '0 10px 10px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-deep)', marginBottom: 10 }}>Where I came down</div>
        <p className="display" style={{ fontSize: 16, lineHeight: 1.6, margin: 0, fontStyle: 'italic', fontWeight: 400 }}>
          Practices stay on Execute. Visibility wins — but as a <em>rail of dots, not a card of rows</em>. The dense management UI moves to a slide-out drawer behind a "Manage" button. Day 50: glance, tick, work. Day 5: same.
        </p>
      </div>

      <div style={{ marginTop: 32, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>
        <strong>What I'd push back on, even now:</strong> if you wire this and find the rail dots are too quiet to actually drive adherence on Day 14, the answer isn't to make the dots bigger — it's to <em>color hollow dots that are 3+ days stale in a faint danger hue</em>. The current mock has a dashed-ring hint at this. Make the system louder only when something's actually wrong.
      </div>
    </div>
  );
}

Object.assign(window, { RationaleV3 });
