// Arca v3 — Execute redesign.
// Practices as a rail, not a panel. Single-column. Figure/ground.

const TASKS = [
  { id: 't1', title: 'Read the Mounier paper, deeply', depth: 'deep', cat: 'strategic', priority: 'PG1', est: 90, note: 'For the institutional acceleration thesis.' },
  { id: 't2', title: 'Draft response to investor email', depth: 'shallow', cat: 'admin', priority: 'PG2', est: 25 },
  { id: 't3', title: 'Outline Q3 product letter', depth: 'deep', cat: 'strategic', priority: 'PG1', est: 60 },
  { id: 't4', title: 'Review hiring loop notes', depth: 'shallow', cat: 'operational', priority: 'PG3', est: 20 },
  { id: 't5', title: 'Process inbox', depth: 'shallow', cat: 'admin', priority: null, est: 15 },
];

const PRACTICES = [
  { id: 'meditate', title: 'Sit, ten minutes', kind: 'practice', target: '10 min', last: 'Yesterday', week: [1,1,0,1,1,0,0], done: false },
  { id: 'walk',     title: 'Walk before screens', kind: 'practice', target: 'Before 9am', last: 'Today, 7:42', week: [1,1,1,1,1,1,0], done: true },
  { id: 'write',    title: 'Pages, by hand', kind: 'practice', target: '3 pages', last: '2 days ago', week: [1,0,1,0,1,0,0], done: false },
  { id: 'read',     title: 'Read fiction', kind: 'practice', target: '20 min', last: 'Today, 22:10', week: [1,1,1,0,1,1,0], done: true },
  { id: 'piano',    title: 'Piano', kind: 'domain', target: '20 min', last: '3 days ago', week: [0,1,0,0,1,0,0], done: false },
  { id: 'arabic',   title: 'Arabic', kind: 'domain', target: '15 min', last: 'Yesterday', week: [1,0,1,1,0,1,0], done: false },
  { id: 'gym',      title: 'Gym', kind: 'domain', target: '45 min', last: 'Today', week: [1,1,0,1,0,1,1], done: true },
];

// ─────────────────────────────────────────────────────────
// PRACTICES RAIL — the central design move.
// 7 dots across the top. Each dot is a practice. Hover for label.
// Click to tick. Click "manage" to open the drawer.
// ─────────────────────────────────────────────────────────
function PracticesRail({ practices, onTick, onManage, density = 'dots' }) {
  const [hoveredId, setHoveredId] = React.useState(null);
  const done = practices.filter(p => p.done).length;
  const total = practices.length;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 24px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--line-2)',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-2)', minWidth: 88 }}>
        Practices
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: density === 'spacious' ? 18 : 10, position: 'relative', minHeight: 28 }}>
        {practices.map(p => (
          <RailDot
            key={p.id}
            practice={p}
            density={density}
            isHovered={hoveredId === p.id}
            onHover={() => setHoveredId(p.id)}
            onLeave={() => setHoveredId(null)}
            onClick={() => onTick(p.id)}
          />
        ))}

        {/* Floating label on hover */}
        {hoveredId && (
          <RailHoverLabel practice={practices.find(p => p.id === hoveredId)} />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: 'var(--text-2)', fontFamily: 'JetBrains Mono', letterSpacing: '0.04em' }}>
        <span>{done} of {total}</span>
        <button
          onClick={onManage}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', fontSize: 11, padding: '4px 8px',
            fontFamily: 'Inter', letterSpacing: '0.06em', textTransform: 'uppercase',
            borderRadius: 6,
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--line-2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Manage
        </button>
      </div>
    </div>
  );
}

function RailDot({ practice, density, isHovered, onHover, onLeave, onClick }) {
  const size = density === 'spacious' ? 14 : density === 'tight' ? 8 : 11;
  const fillColor = practice.done ? 'var(--accent)' : 'transparent';
  const borderColor = practice.done ? 'var(--accent)' : 'var(--line)';

  // Streak warning — if hollow and last log was 3+ days ago
  const isStaleWarning = !practice.done && practice.last && practice.last.includes('days ago');

  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      aria-label={`${practice.title}${practice.done ? ' — done' : ''}`}
      style={{
        width: size + 14, height: size + 14, padding: 0,
        background: 'transparent', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}
    >
      <span style={{
        width: size, height: size, borderRadius: '50%',
        background: fillColor,
        border: `1.5px solid ${borderColor}`,
        transition: 'transform 160ms ease-out, background 200ms ease-out',
        transform: isHovered ? 'scale(1.18)' : 'scale(1)',
        boxShadow: isHovered ? '0 0 0 4px var(--accent-soft)' : 'none',
      }} />
      {/* Faint warning ring for stale practices */}
      {isStaleWarning && !isHovered && (
        <span style={{
          position: 'absolute', inset: 4,
          borderRadius: '50%',
          border: '1px dashed rgba(169, 64, 50, 0.35)',
          pointerEvents: 'none',
        }} />
      )}
    </button>
  );
}

function RailHoverLabel({ practice }) {
  if (!practice) return null;
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', left: 0,
      background: 'var(--ink)', color: 'var(--paper)',
      padding: '8px 12px', borderRadius: 8,
      fontSize: 12, fontFamily: 'Inter', whiteSpace: 'nowrap',
      pointerEvents: 'none', zIndex: 10,
      boxShadow: '0 8px 24px rgba(15,24,34,0.18)',
      animation: 'fadeIn 140ms ease-out',
    }}>
      <div style={{
        fontWeight: 500,
        textDecoration: practice.done ? 'line-through' : 'none',
        opacity: practice.done ? 0.55 : 1,
        transition: 'opacity 320ms ease-out',
      }}>{practice.title}</div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, opacity: 0.6, letterSpacing: '0.04em', marginTop: 2 }}>
        {practice.target} · {practice.done ? 'done today' : `last ${practice.last.toLowerCase()}`}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PRACTICES DRAWER — slides in from the right when "Manage" clicked.
// All the meta / management UI lives here. Off the main surface.
// ─────────────────────────────────────────────────────────
function PracticesDrawer({ open, practices, onTick, onClose }) {
  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: open ? 'rgba(15,24,34,0.18)' : 'transparent',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'background 240ms ease-out',
        }}
      />
      {/* Drawer */}
      <aside style={{
        position: 'absolute', top: 0, bottom: 0, right: 0,
        width: 420, zIndex: 60,
        background: 'var(--paper)',
        borderLeft: '1px solid var(--line)',
        boxShadow: open ? '-12px 0 40px rgba(15,24,34,0.12)' : 'none',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
      }}>
        <header style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 4 }}>Practices</div>
            <div className="display" style={{ fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.015em' }}>The ground.</div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', fontSize: 14, padding: 4,
          }}>✕</button>
        </header>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px 20px' }}>
          {practices.map((p, i) => (
            <DrawerRow key={p.id} practice={p} onTick={() => onTick(p.id)} isLast={i === practices.length - 1} />
          ))}

          <button style={{
            marginTop: 12, marginLeft: 8,
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter', fontSize: 13, color: 'var(--text-3)',
            padding: '10px 0', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New practice
          </button>
        </div>
      </aside>
    </>
  );
}

function DrawerRow({ practice, onTick, isLast }) {
  return (
    <div style={{
      padding: '14px 8px',
      borderBottom: isLast ? 'none' : '1px solid var(--line-2)',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <Tick checked={practice.done} onClick={onTick} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: practice.done ? 'var(--text-3)' : 'var(--ink)', textDecoration: practice.done ? 'line-through' : 'none' }}>
          {practice.title}
        </div>
        <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>{practice.target}</span>
          <span style={{ display: 'inline-flex', gap: 3 }}>
            {practice.week.map((d, i) => (
              <span key={i} style={{
                width: 5, height: 5, borderRadius: '50%',
                background: d ? 'var(--accent)' : 'transparent',
                border: d ? 'none' : '1px solid var(--line)',
              }} />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

function Tick({ checked, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 28, height: 28, padding: 0, flexShrink: 0,
        background: checked ? 'var(--accent-soft)' : 'transparent',
        border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--line)'}`,
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 240ms ease-out',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3.2 8.4 L6.6 11.6 L12.8 4.8"
          stroke="var(--accent-deep)" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="14" strokeDashoffset={checked ? 0 : 14}
          style={{ transition: 'stroke-dashoffset 320ms cubic-bezier(0.4, 0, 0.2, 1)', opacity: checked ? 1 : 0 }}
        />
      </svg>
    </button>
  );
}

Object.assign(window, { PracticesRail, PracticesDrawer, Tick });
