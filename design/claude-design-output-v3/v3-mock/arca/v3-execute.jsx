// Arca v3 — Execute layout shell.
// Single column. Practices rail at top. Hero timer. AI bar. Today list. Slim stats footer.
// Practices drawer slides in from the right when "Manage" is clicked.

const V3_W = 1280;
const V3_H = 840;

function ExecuteV3({ tweaks = {} }) {
  const {
    practicesDensity = 'default',     // 'tight' | 'default' | 'spacious'
    aiBarPosition = 'above-list',     // 'above-list' | 'below-hero' | 'floating'
    statsMode = 'slim',               // 'slim' | 'cards' | 'hidden'
    showDepthTags = false,            // hide DEEP/STRATEGIC by default — hover only
  } = tweaks;

  const [practices, setPractices] = React.useState(PRACTICES);
  const [taskDone, setTaskDone] = React.useState({});
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeTaskId, setActiveTaskId] = React.useState('t1');
  const [focusMode, setFocusMode] = React.useState(false);

  const togglePractice = (id) => setPractices(ps => ps.map(p => p.id === id ? { ...p, done: !p.done } : p));
  const toggleTask = (id) => setTaskDone(s => ({ ...s, [id]: !s[id] }));
  const activeTask = TASKS.find(t => t.id === activeTaskId);

  // Entering focus mode closes the drawer (mutually exclusive surfaces)
  React.useEffect(() => { if (focusMode) setDrawerOpen(false); }, [focusMode]);

  // Esc closes the drawer (focus mode owns its own Esc handler)
  React.useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div style={{
      width: V3_W, height: V3_H, position: 'relative', overflow: 'hidden',
      background: 'var(--paper)', fontFamily: 'Inter, system-ui',
      borderRadius: 12, color: 'var(--text)',
    }}>
      {/* Workspace shell — hidden while focus mode owns the surface */}
      <div style={{
        position: 'absolute', inset: 0,
        display: focusMode ? 'none' : 'flex',
        flexDirection: 'column',
      }}>
        {/* Top bar */}
        <TopBar />

        {/* Practices rail — the core move */}
        <PracticesRail
          practices={practices}
          density={practicesDensity}
          onTick={togglePractice}
          onManage={() => setDrawerOpen(true)}
        />

        {/* Main scroll area */}
        <main style={{
          flex: 1, overflow: 'auto',
          display: 'flex', flexDirection: 'column',
          padding: '32px 64px 0',
          maxWidth: 880, width: '100%', margin: '0 auto',
        }}>
          {/* Date eyebrow + greeting */}
          <header style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-deep)', marginBottom: 6 }}>
              Wednesday · 30 April
            </div>
            <h1 className="display" style={{ fontSize: 30, color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0, fontWeight: 500 }}>
              The week is half won.
            </h1>
          </header>

          {/* Hero timer */}
          <HeroTimer task={activeTask} onEnterFocus={() => setFocusMode(true)} />

          {/* AI bar — between hero and list when above-list */}
          {aiBarPosition === 'above-list' && <AiBar />}

          {/* Today list */}
          <section style={{ marginTop: aiBarPosition === 'above-list' ? 24 : 32 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 2 }}>Today</div>
                <div className="display" style={{ fontSize: 18, color: 'var(--ink)' }}>5 tasks · 1 in flight</div>
              </div>
              <button style={ghostBtn}>+ Add</button>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {TASKS.map(t => (
                <TaskRow
                  key={t.id}
                  task={t}
                  isActive={t.id === activeTaskId}
                  showDepthTags={showDepthTags}
                  checked={!!taskDone[t.id]}
                  onToggleCheck={() => toggleTask(t.id)}
                  onActivate={() => setActiveTaskId(t.id)}
                />
              ))}
            </ul>
          </section>

          {/* Slim stats footer */}
          {statsMode !== 'hidden' && <StatsFooter mode={statsMode} />}

          <div style={{ height: 32 }} />
        </main>

        {/* Drawer */}
        <PracticesDrawer
          open={drawerOpen}
          practices={practices}
          onTick={togglePractice}
          onClose={() => setDrawerOpen(false)}
        />
      </div>

      {/* Focus mode — full-bleed surface, owns timer state */}
      {focusMode && <FocusModeV3 task={activeTask} onExit={() => setFocusMode(false)} />}
    </div>
  );
}

// ─── Top bar ───
function TopBar() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '12px 24px',
      borderBottom: '1px solid var(--line-2)',
      background: 'var(--paper)',
      gap: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ArcaMark size={22} />
        <div className="display" style={{ fontSize: 14, color: 'var(--ink)', letterSpacing: '0.18em', fontWeight: 500, textTransform: 'uppercase' }}>Arca</div>
      </div>

      <nav style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
        {['Execute', 'Plan', 'Health', 'Wealth', 'Wise'].map((t, i) => (
          <button key={t} style={{
            background: i === 0 ? 'var(--surface-2)' : 'transparent',
            border: 'none', cursor: 'pointer',
            padding: '6px 12px', borderRadius: 8,
            fontSize: 13, fontWeight: i === 0 ? 600 : 400,
            color: i === 0 ? 'var(--ink)' : 'var(--text-2)',
            fontFamily: 'Inter',
          }}>{t}</button>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 999,
        background: 'var(--accent-soft)', color: 'var(--accent-deep)',
        fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.04em',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
        12 day streak
      </div>

      <button style={{ ...ghostBtn, padding: '6px 10px' }}>⚙</button>
    </div>
  );
}

// ─── Hero timer ───
function HeroTimer({ task, onEnterFocus }) {
  return (
    <section style={{
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 16,
      padding: '24px 28px',
      display: 'flex', alignItems: 'center', gap: 28,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 6 }}>
          Current focus · session 1 of 4
        </div>
        <div className="display" style={{ fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.015em', marginBottom: 8 }}>
          {task?.title}
        </div>
        {task?.note && (
          <div style={{ fontSize: 13, color: 'var(--text-2)', fontStyle: 'italic' }}>{task.note}</div>
        )}
      </div>

      <div style={{
        fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: 56,
        color: 'var(--ink)', letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        12:48
      </div>

      <button onClick={onEnterFocus} style={{
        background: 'var(--accent)', color: 'var(--paper)', border: 'none',
        padding: '12px 22px', borderRadius: 10, cursor: 'pointer',
        fontFamily: 'Inter', fontWeight: 500, fontSize: 14, letterSpacing: '0.02em',
      }}>
        Enter focus
      </button>
    </section>
  );
}

// ─── AI bar ───
function AiBar() {
  return (
    <div style={{
      marginTop: 20,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px',
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 12,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 999,
        background: 'var(--surface-2)', border: '1px solid var(--line-2)',
        fontSize: 11, color: 'var(--text-2)', fontFamily: 'JetBrains Mono', letterSpacing: '0.04em',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--d-execute)' }} />
        Claude · auto
      </div>
      <input
        readOnly
        placeholder="Capture, plan, or ask…"
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          fontFamily: 'Inter', fontSize: 14, color: 'var(--ink)',
        }}
      />
      <button style={{
        background: 'var(--ink)', color: 'var(--paper)', border: 'none',
        padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
        fontFamily: 'Inter', fontSize: 12, letterSpacing: '0.02em',
      }}>↵</button>
    </div>
  );
}

// ─── Task row ───
function TaskRow({ task, isActive, showDepthTags, onActivate, checked, onToggleCheck }) {
  const [hovered, setHovered] = React.useState(false);
  const depthHue = task.depth === 'deep' ? 'var(--d-execute)' : 'var(--text-3)';

  return (
    <li
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onActivate}
      style={{
        padding: '14px 12px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        borderRadius: 8, marginLeft: -12, marginRight: -12,
        background: isActive ? 'var(--accent-soft)' : (hovered ? 'rgba(176,122,62,0.025)' : 'transparent'),
        borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
        paddingLeft: isActive ? 9 : 12,
        transition: 'background 160ms',
      }}
    >
      <Tick checked={!!checked} onClick={(e) => { e.stopPropagation(); onToggleCheck && onToggleCheck(); }} />

      {/* Depth dot — always visible, calm */}
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: depthHue, opacity: task.depth === 'deep' ? 0.8 : 0.4,
        flexShrink: 0,
      }} />

      <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0 }}>
        <span style={{ fontSize: 15, fontWeight: isActive ? 500 : 400, color: 'var(--ink)' }}>
          {task.title}
        </span>

        {/* Tags only on hover unless explicitly enabled */}
        {(showDepthTags || hovered) && (
          <span style={{
            fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em',
            color: 'var(--text-3)', textTransform: 'uppercase',
            opacity: showDepthTags ? 1 : 0.7,
          }}>
            {task.depth} · {task.cat}
          </span>
        )}
      </div>

      {task.priority && (
        <span style={{
          fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.06em',
          color: task.priority === 'PG1' ? 'var(--accent-deep)' : 'var(--text-3)',
          fontWeight: 500,
        }}>
          {task.priority}
        </span>
      )}

      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)', minWidth: 32, textAlign: 'right' }}>
        {task.est}m
      </span>
    </li>
  );
}

// ─── Stats footer ───
function StatsFooter({ mode }) {
  if (mode === 'cards') {
    return (
      <section style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Today', value: '2/5' },
          { label: 'Deep ratio', value: '64%' },
          { label: 'Closed (wk)', value: '13' },
          { label: 'This week', value: '4/7' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 22, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
          </div>
        ))}
      </section>
    );
  }

  // slim — single horizontal line
  return (
    <section style={{
      marginTop: 32, paddingTop: 16,
      borderTop: '1px solid var(--line-2)',
      display: 'flex', alignItems: 'center', gap: 24,
      fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)',
      letterSpacing: '0.04em',
    }}>
      <span><strong style={{ color: 'var(--ink)', fontWeight: 500 }}>2 / 5</strong> today</span>
      <span style={{ width: 1, height: 12, background: 'var(--line)' }} />
      <span><strong style={{ color: 'var(--ink)', fontWeight: 500 }}>64%</strong> deep ratio</span>
      <span style={{ width: 1, height: 12, background: 'var(--line)' }} />
      <span><strong style={{ color: 'var(--ink)', fontWeight: 500 }}>13</strong> closed this week</span>
      <span style={{ flex: 1 }} />
      <span style={{ opacity: 0.5 }}>app open · untracked</span>
    </section>
  );
}

const ghostBtn = {
  background: 'transparent', color: 'var(--text-2)',
  border: '1px solid var(--line)', padding: '6px 12px',
  borderRadius: 8, cursor: 'pointer',
  fontFamily: 'Inter', fontSize: 12, letterSpacing: '0.02em',
};

Object.assign(window, { ExecuteV3, TopBar, HeroTimer, AiBar, TaskRow, StatsFooter });
