// Practices panel v2 — designerly checklist.
// Tick is the feature. Meta hides until asked.

function PracticesPanel() {
  const [items, setItems] = React.useState([
    { id: 'meditate', name: 'Sit, ten minutes', kind: 'Ritual', target: '10 min minimum', last: 'Yesterday', week: [1,1,0,1,1,0,0], ticked: false },
    { id: 'walk',     name: 'Walk before screens', kind: 'Habit', target: 'Before 9am', last: 'Today, 7:42', week: [1,1,1,1,1,1,0], ticked: true },
    { id: 'write',    name: 'Pages, by hand',     kind: 'Practice', target: '3 pages', last: '2 days ago', week: [1,0,1,0,1,0,0], ticked: false },
    { id: 'read',     name: 'Read fiction',       kind: 'Habit', target: '20 min', last: 'Today, 22:10', week: [1,1,1,0,1,1,0], ticked: true },
    { id: 'review',   name: 'Tomorrow, on paper', kind: 'Ritual', target: 'Before bed', last: 'Yesterday', week: [1,1,1,1,1,0,0], ticked: false },
  ]);
  const [expanded, setExpanded] = React.useState(null);
  const [hovered, setHovered] = React.useState(null);

  const toggle = (id) => {
    setItems(items.map(it => it.id === id ? { ...it, ticked: !it.ticked, _justTicked: !it.ticked } : it));
  };

  const totalTicked = items.filter(i => i.ticked).length;

  return (
    <section style={{
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 14,
      padding: '20px 24px 14px',
    }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 4 }}>Practices · today</div>
          <div className="display" style={{ fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.015em' }}>{totalTicked} of {items.length}</div>
        </div>

        {/* Week strip — 7 days, dots, calm at-a-glance */}
        <WeekStrip days={[1,1,1,1,0,0,0]} todayIdx={3} />
      </header>

      {/* List */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((it, i) => (
          <PracticeRow
            key={it.id}
            item={it}
            isLast={i === items.length - 1}
            isExpanded={expanded === it.id}
            isHovered={hovered === it.id}
            onHover={() => setHovered(it.id)}
            onLeave={() => setHovered(null)}
            onTick={() => toggle(it.id)}
            onExpand={() => setExpanded(expanded === it.id ? null : it.id)}
          />
        ))}
      </ul>

      {/* Add new */}
      <button style={{
        marginTop: 8, background: 'transparent', border: 'none', cursor: 'pointer',
        fontFamily: 'Inter', fontSize: 13, color: 'var(--text-3)',
        padding: '10px 0', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New practice
      </button>
    </section>
  );
}

function WeekStrip({ days, todayIdx }) {
  const labels = ['M','T','W','T','F','S','S'];
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
      {days.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: d ? 'var(--accent)' : 'transparent',
            border: d ? 'none' : `1px solid ${i === todayIdx ? 'var(--ink)' : 'var(--line)'}`,
            outline: i === todayIdx && d ? '1px solid var(--ink)' : 'none',
            outlineOffset: 2,
          }} />
          <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-3)', letterSpacing: '0.04em' }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

function PracticeRow({ item, isLast, isExpanded, isHovered, onHover, onLeave, onTick, onExpand }) {
  return (
    <li
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        borderBottom: isLast ? 'none' : '1px solid var(--line-2)',
        padding: '14px 0',
        transition: 'background 160ms',
        background: isHovered ? 'rgba(176,122,62,0.025)' : 'transparent',
        marginLeft: -8, marginRight: -8, paddingLeft: 8, paddingRight: 8,
        borderRadius: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Tick checked={item.ticked} onClick={onTick} justTicked={item._justTicked} />

        <button
          onClick={onExpand}
          style={{
            flex: 1, background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, textAlign: 'left',
            display: 'flex', alignItems: 'baseline', gap: 12,
          }}
        >
          <span style={{
            fontFamily: 'Inter', fontSize: 15, fontWeight: 500,
            color: item.ticked ? 'var(--text-3)' : 'var(--ink)',
            position: 'relative',
            transition: 'color 240ms',
          }}>
            {item.name}
            {item.ticked && (
              <span style={{
                position: 'absolute', left: 0, right: 0, top: '52%',
                height: 1, background: 'var(--text-3)',
                transformOrigin: 'left',
                animation: 'strike 240ms ease-out forwards',
              }} />
            )}
          </span>

          {/* Hover-only meta */}
          {(isHovered || isExpanded) && !item.ticked && (
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)',
              opacity: 0, animation: 'fadeIn 200ms ease-out 80ms forwards',
            }}>
              {item.target} · last {item.last.toLowerCase()}
            </span>
          )}
        </button>

        <button onClick={onExpand} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-3)', padding: 4,
          transform: isExpanded ? 'rotate(90deg)' : 'none',
          transition: 'transform 200ms',
          opacity: isHovered || isExpanded ? 0.7 : 0,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 1.5L7 5L3 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Drawer */}
      {isExpanded && (
        <div style={{
          marginTop: 12, marginLeft: 44,
          paddingTop: 12, paddingBottom: 4,
          borderTop: '1px dashed var(--line)',
          fontFamily: 'JetBrains Mono', fontSize: 11,
          color: 'var(--text-2)', lineHeight: 1.7,
          animation: 'slideDown 220ms ease-out',
        }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <Meta label="Kind"   value={item.kind} />
            <Meta label="Target" value={item.target} />
            <Meta label="Last"   value={item.last} />
          </div>
          <div style={{ marginTop: 10, fontFamily: 'Inter', fontSize: 12, color: 'var(--text-3)' }}>
            <span style={{ display: 'inline-flex', gap: 3, marginRight: 8 }}>
              {item.week.map((d, i) => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: d ? 'var(--accent)' : 'transparent',
                  border: d ? 'none' : '1px solid var(--line)',
                }} />
              ))}
            </span>
            {item.week.filter(d => d).length} of 7 this week
          </div>
        </div>
      )}
    </li>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 2 }}>{label}</div>
      <div style={{ color: 'var(--ink-2)' }}>{value}</div>
    </div>
  );
}

// ── Tick — the hero. Hand-drawn stroke, parchment imprint when checked. ──
function Tick({ checked, onClick, justTicked }) {
  const id = React.useId().replace(/:/g, '');
  return (
    <button
      onClick={onClick}
      aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
      style={{
        width: 28, height: 28, padding: 0,
        background: checked ? 'var(--accent-soft)' : 'transparent',
        border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--line)'}`,
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 240ms ease-out, border-color 240ms ease-out, transform 120ms',
        flexShrink: 0,
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.94)'}
      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3.2 8.4 L6.6 11.6 L12.8 4.8"
          stroke="var(--accent-deep)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="14"
          strokeDashoffset={checked ? 0 : 14}
          style={{
            transition: justTicked
              ? 'stroke-dashoffset 320ms cubic-bezier(0.4, 0, 0.2, 1)'
              : 'stroke-dashoffset 200ms ease-out',
            opacity: checked ? 1 : 0,
          }}
        />
      </svg>
    </button>
  );
}

Object.assign(window, { PracticesPanel, WeekStrip, PracticeRow, Tick });
