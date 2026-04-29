// Desktop Execute home — new identity, with sidebar showing 5 domains.

const DESK_W = 1280, DESK_H = 820;

function DesktopExecute() {
  const [tab, setTab] = React.useState('execute');
  return (
    <div className="ab" style={{
      width: DESK_W, height: DESK_H,
      background: 'var(--paper)',
      display: 'grid', gridTemplateColumns: '220px 1fr',
      fontFamily: 'Inter, system-ui',
      borderRadius: 12, overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <aside style={{
        background: 'var(--ink)', color: 'var(--paper)',
        padding: '20px 16px',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 18px' }}>
          <ArcaMark size={32} />
          <div className="display" style={{ fontSize: 18, color: 'var(--paper)', letterSpacing: '0.18em', fontWeight: 500, textTransform: 'uppercase' }}>Arca</div>
        </div>

        <NavGroup label="Operate" />
        <NavItem icon="execute" label="Execute" active={tab === 'execute'} hue="var(--d-execute)" onClick={() => setTab('execute')} />
        <NavItem icon="plan"    label="Plan"    hue="var(--d-execute)" />

        <NavGroup label="Life" />
        <NavItem icon="health" label="Health" hue="var(--d-health)" badge="3" />
        <NavItem icon="wealth" label="Wealth" hue="var(--d-wealth)" />
        <NavItem icon="wise"   label="Wise"   hue="var(--d-wise)" />

        <div style={{ flex: 1 }} />
        <div style={{
          marginTop: 'auto', padding: 12, borderRadius: 10,
          background: 'rgba(244,239,230,0.06)',
          fontSize: 11, color: 'rgba(244,239,230,0.55)', lineHeight: 1.5,
        }}>
          <div style={{ color: 'var(--accent-2)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>Local-first</div>
          Ledger up to date · 4 days backed up
        </div>
      </aside>

      {/* Main */}
      <main style={{ overflow: 'auto', padding: '24px 32px 32px' }}>
        <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-deep)' }}>Wednesday · 29 April</div>
            <div className="display" style={{ fontSize: 32, color: 'var(--ink)', letterSpacing: '-0.02em', marginTop: 4 }}>The week is half won.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn ghost icon="plus">Capture</Btn>
            <Btn icon="play">Start sprint</Btn>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
          {/* Left column: timer + tasks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <TimerCard />
            <TasksCard />
          </div>

          {/* Right column: review + practices */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ReviewCard />
            <PracticesCard />
          </div>
        </div>
      </main>
    </div>
  );
}

function NavGroup({ label }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'rgba(244,239,230,0.45)', padding: '14px 8px 6px',
    }}>{label}</div>
  );
}
function NavItem({ icon, label, active, hue, badge, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px', borderRadius: 8,
      background: active ? 'rgba(244,239,230,0.08)' : 'transparent',
      color: active ? 'var(--paper)' : 'rgba(244,239,230,0.7)',
      border: 'none', cursor: 'pointer', font: 'inherit', textAlign: 'left',
      fontSize: 13, fontWeight: active ? 600 : 500,
      position: 'relative',
    }}>
      <span style={{
        width: 4, height: 18, borderRadius: 2,
        background: active ? hue : 'transparent',
        marginRight: -2,
      }} />
      <SysIcon name={icon} size={16} stroke={1.8} color={active ? 'var(--accent-2)' : 'rgba(244,239,230,0.7)'} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span style={{ fontSize: 10, background: 'var(--accent)', color: 'var(--paper)', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>{badge}</span>}
    </button>
  );
}

function Btn({ children, icon, ghost }) {
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 14px', borderRadius: 10,
      background: ghost ? 'transparent' : 'var(--accent)',
      color: ghost ? 'var(--ink)' : 'var(--paper)',
      border: ghost ? '1px solid var(--line)' : 'none',
      fontSize: 13, fontWeight: 600, cursor: 'pointer', font: 'inherit',
      boxShadow: ghost ? 'none' : 'var(--shadow-accent)',
    }}>
      {icon && <SysIcon name={icon} size={14} stroke={2} color={ghost ? 'currentColor' : 'var(--paper)'} />}
      {children}
    </button>
  );
}

function TimerCard() {
  const r = 92, c = 2 * Math.PI * r, p = 0.62;
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--line)',
      padding: 28, boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: 28,
    }}>
      <div style={{ position: 'relative', width: 220, height: 220 }}>
        <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="110" cy="110" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
          <circle cx="110" cy="110" r={r} fill="none" stroke="var(--accent)" strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p)} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="num" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 44, color: 'var(--ink)', letterSpacing: '-0.04em' }}>15:24</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600 }}>Sprint · 25m</div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-deep)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Now</div>
        <div className="display" style={{ fontSize: 24, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 6 }}>Draft Phase B brief — voice capture</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>Strategic · 3rd session today · started 09:46</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn icon="pause">Pause</Btn>
          <Btn ghost icon="check">Close out</Btn>
          <Btn ghost>+5 min</Btn>
        </div>
      </div>
    </div>
  );
}

function TasksCard() {
  const tasks = [
    { done: true,  t: 'Review Arboleaf parser fixtures',     tag: 'Health',  hue: 'var(--d-health)' },
    { done: false, t: 'Draft Phase B brief — voice capture', tag: 'Plan',    hue: 'var(--d-execute)', active: true },
    { done: false, t: 'Reconcile super contributions Q3',     tag: 'Wealth',  hue: 'var(--d-wealth)' },
    { done: false, t: '20 min Arabic — chapter 4',            tag: 'Wise',    hue: 'var(--d-wise)' },
  ];
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--line)',
      padding: 24, boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-deep)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Today</div>
          <div className="display" style={{ fontSize: 22, color: 'var(--ink)', marginTop: 2 }}>Four to close</div>
        </div>
        <Btn ghost icon="plus">Add</Btn>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tasks.map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px',
            borderTop: i ? '1px solid var(--line-2)' : 'none',
            opacity: t.done ? 0.5 : 1,
            background: t.active ? 'var(--accent-soft)' : 'transparent',
            margin: t.active ? '0 -8px' : 0,
            paddingLeft: t.active ? 12 : 4,
            paddingRight: t.active ? 12 : 4,
            borderRadius: t.active ? 10 : 0,
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              border: `1.5px solid ${t.done ? 'var(--ok)' : 'var(--line)'}`,
              background: t.done ? 'var(--ok)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {t.done && <SysIcon name="check" size={12} color="var(--paper)" stroke={3} />}
            </div>
            <div style={{ flex: 1, fontSize: 14, color: 'var(--ink)', textDecoration: t.done ? 'line-through' : 'none', fontWeight: t.active ? 600 : 500 }}>{t.t}</div>
            <span style={{
              fontSize: 10, fontWeight: 700, color: t.hue, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '2px 8px', borderRadius: 99, border: `1px solid ${t.hue}`, opacity: 0.85,
            }}>{t.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewCard() {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--line)',
      padding: 24, boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-deep)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>Week 18</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <Metric n="14h 22" sub="Deep work" />
        <Metric n="0.71"   sub="Deep ratio" />
        <Metric n="11"     sub="Tasks closed" />
        <Metric n="3 / 5"  sub="Practices held" />
      </div>
      {/* Deep ratio bar */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Time split</div>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ flex: 71, background: 'var(--accent)' }} />
        <div style={{ flex: 21, background: 'var(--d-execute)', opacity: 0.6 }} />
        <div style={{ flex: 8,  background: 'var(--surface-2)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-2)' }}>
        <span>Strategic 71%</span><span>Maintenance 21%</span><span>Idle 8%</span>
      </div>
    </div>
  );
}
function Metric({ n, sub }) {
  return (
    <div>
      <div className="num" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, color: 'var(--ink)', letterSpacing: '-0.03em', fontWeight: 500 }}>{n}</div>
      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function PracticesCard() {
  const ps = [
    { name: 'Lift',         hue: 'var(--d-health)', streak: 12, days: [1,1,1,0,1,1,1] },
    { name: 'Meditate',     hue: 'var(--d-wise)',   streak: 28, days: [1,1,1,1,1,1,1] },
    { name: 'Read',         hue: 'var(--d-wise)',   streak: 4,  days: [0,1,1,1,1,0,1] },
    { name: 'Arabic',       hue: 'var(--d-wise)',   streak: 0,  days: [1,0,0,1,0,0,1] },
  ];
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--line)',
      padding: 24, boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-deep)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Practices</div>
          <div className="display" style={{ fontSize: 18, color: 'var(--ink)', marginTop: 2 }}>This week</div>
        </div>
      </div>
      {ps.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: p.hue }} />
          <div style={{ flex: 1, fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{p.name}</div>
          <div style={{ display: 'flex', gap: 3 }}>
            {p.days.map((d, j) => (
              <div key={j} style={{ width: 12, height: 12, borderRadius: 3, background: d ? p.hue : 'var(--surface-2)', opacity: d ? 0.85 : 1 }} />
            ))}
          </div>
          <div className="num" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-2)', minWidth: 28, textAlign: 'right' }}>{p.streak}d</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { DesktopExecute });
