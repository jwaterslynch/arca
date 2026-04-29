// iOS Capture — tile grid replacement for the long-scroll List.

const IOS_W = 393, IOS_H = 852;

// ── Reusable sparkline ──
function Sparkline({ values, color = 'var(--accent)', height = 36, width = 120, fill = false }) {
  if (!values || values.length < 2) return <div style={{ height, width }} />;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => [i * step, height - ((v - min) / range) * (height - 6) - 3]);
  const d = 'M ' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ');
  const area = d + ` L ${width},${height} L 0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      {fill && <path d={area} fill={color} opacity="0.10" />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.4" fill={color} />
    </svg>
  );
}

// ── A calm metric tile ──
function MetricTile({
  icon, label, value, unit, delta, deltaDir, sparkValues, accent = 'var(--accent)',
  span = 1, sub, onClick,
}) {
  const isUp = deltaDir === 'up';
  const isDown = deltaDir === 'down';
  return (
    <button
      onClick={onClick}
      style={{
        gridColumn: `span ${span}`,
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 18,
        padding: 16,
        textAlign: 'left',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex', flexDirection: 'column', gap: 12,
        minHeight: 132,
        cursor: 'pointer',
        font: 'inherit',
        color: 'var(--text)',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: accent, opacity: 0.14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent,
        }}>
          <SysIcon name={icon} size={14} stroke={2} color={accent} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '-0.005em' }}>{label}</div>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div className="num" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 26, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em',
          }}>{value}</div>
          {unit && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{unit}</span>}
        </div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', justifyContent: 'space-between' }}>
        {sparkValues && <Sparkline values={sparkValues} color={accent} width={span === 2 ? 220 : 110} height={32} fill />}
        {delta != null && (
          <div style={{
            fontSize: 11, fontWeight: 600, color: isDown ? 'var(--danger)' : isUp ? 'var(--ok)' : 'var(--text-2)',
            display: 'flex', alignItems: 'center', gap: 2, fontVariantNumeric: 'tabular-nums',
          }}>
            {isUp ? '↑' : isDown ? '↓' : '·'} {delta}
          </div>
        )}
      </div>
    </button>
  );
}

// ── Group header ──
function GroupHeader({ children, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '24px 4px 10px',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--accent-deep)',
      }}>{children}</div>
      {count != null && (
        <div style={{ fontSize: 11, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>{count} metrics</div>
      )}
    </div>
  );
}

// ── App chrome ──
function IOSAppShell({ title, subtitle, children, tab = 'history' }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--paper)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '60px 20px 16px',
        borderBottom: '1px solid var(--line-2)',
        background: 'rgba(244, 239, 230, 0.92)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <ArcaWordmark size={22} />
          <button style={{
            border: 'none', background: 'var(--accent-soft)', color: 'var(--accent-deep)',
            width: 32, height: 32, borderRadius: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SysIcon name="plus" size={16} color="var(--accent-deep)" stroke={2.2} />
          </button>
        </div>
        <div className="display" style={{ fontSize: 28, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{subtitle}</div>}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 110px' }}>
        {children}
      </div>

      {/* Tab bar */}
      <div style={{
        position: 'absolute', bottom: 34, left: 0, right: 0,
        background: 'rgba(253, 251, 246, 0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--line-2)',
        padding: '8px 0 24px',
        display: 'flex', justifyContent: 'space-around',
      }}>
        <TabBtn name="history" label="History" active={tab === 'history'} />
        <TabBtn name="capture" label="Capture" active={tab === 'capture'} />
        <TabBtn name="wise" label="Insights" active={tab === 'wise'} />
      </div>
    </div>
  );
}
function TabBtn({ name, label, active }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      color: active ? 'var(--accent-deep)' : 'var(--text-3)',
    }}>
      <SysIcon name={name} size={22} stroke={active ? 2.2 : 1.6} />
      <div style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '0.02em' }}>{label}</div>
    </div>
  );
}

// ── Surface 1: populated tile grid ──
function IOSCapturePopulated() {
  // Synthetic but plausible data
  const w = [73.2, 73.0, 72.8, 72.9, 72.6, 72.5, 72.2, 72.4, 72.1, 71.9, 72.0, 71.7];
  const bf = [21.4, 21.3, 21.2, 21.0, 21.1, 20.9, 20.7, 20.8, 20.6, 20.5, 20.4, 20.3];
  const mm = [55.1, 55.2, 55.2, 55.4, 55.3, 55.5, 55.6, 55.5, 55.7, 55.8, 55.8, 56.0];
  const rec = [62, 71, 58, 49, 65, 72, 78, 60, 55, 68, 74, 81];
  const hrv = [42, 51, 38, 35, 48, 53, 59, 44, 41, 50, 56, 62];
  const sleep = [6.8, 7.4, 6.2, 5.8, 7.1, 7.6, 8.0, 6.9, 6.5, 7.3, 7.7, 8.1];

  return (
    <IOSAppShell title="History" subtitle="Two weeks · 6 modules tracked">
      <GroupHeader count={3}>Body composition</GroupHeader>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <MetricTile icon="scale" label="Weight" value="71.7" unit="kg" delta="−1.5kg" deltaDir="down"
          sparkValues={w} accent="var(--d-health)" sub="14 days · 12 entries" />
        <MetricTile icon="flame" label="Body fat" value="20.3" unit="%" delta="−1.1pt" deltaDir="down"
          sparkValues={bf} accent="var(--d-health)" sub="−1.1 since 15 Apr" />
        <MetricTile icon="heart" label="Muscle mass" value="56.0" unit="kg" delta="+0.9kg" deltaDir="up"
          sparkValues={mm} accent="var(--d-health)" sub="Steady gain" span={2} />
      </div>

      <GroupHeader count={4}>Recovery</GroupHeader>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <MetricTile icon="spark" label="Recovery" value="81" unit="%" delta="+13" deltaDir="up"
          sparkValues={rec} accent="var(--accent)" sub="Above 14-day avg" />
        <MetricTile icon="dot" label="HRV" value="62" unit="ms" delta="+11" deltaDir="up"
          sparkValues={hrv} accent="var(--accent)" sub="Strong day" />
        <MetricTile icon="moon" label="Sleep" value="8.1" unit="h" delta="+0.5h" deltaDir="up"
          sparkValues={sleep} accent="var(--d-wise)" sub="Last night" />
        <MetricTile icon="flame" label="Workout impact" value="−4" unit="%" delta="light" deltaDir=""
          sparkValues={[-12, -8, -3, -16, -5, 0, -7, -10, -2, -8, -4]} accent="var(--d-wealth)" sub="Today's session" />
      </div>

      <GroupHeader>Workouts</GroupHeader>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        <button style={{
          background: 'var(--surface)', border: '1px dashed var(--line)', borderRadius: 18,
          padding: '20px 16px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
          color: 'var(--text)', cursor: 'pointer', font: 'inherit',
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SysIcon name="image" size={20} color="var(--accent-deep)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Capture whiteboard WOD</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Photo + manual fallback · soon</div>
          </div>
          <SysIcon name="arrow" size={18} color="var(--text-3)" />
        </button>
      </div>
    </IOSAppShell>
  );
}

// ── Surface 2: empty state ──
function IOSCaptureEmpty() {
  return (
    <IOSAppShell title="History" subtitle="Nothing captured yet">
      <div style={{ marginTop: 32 }}>
        <GroupHeader count={3}>Body composition</GroupHeader>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <EmptyTile icon="scale" label="Weight"      hint="Arboleaf screenshot" />
          <EmptyTile icon="flame" label="Body fat"    hint="From scale capture" />
          <EmptyTile icon="heart" label="Muscle mass" hint="From scale capture" span={2} />
        </div>

        <GroupHeader count={4}>Recovery</GroupHeader>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <EmptyTile icon="spark" label="Recovery" hint="Morpheus screenshot" />
          <EmptyTile icon="dot"   label="HRV"      hint="Morpheus screenshot" />
          <EmptyTile icon="moon"  label="Sleep"    hint="Manual or HealthKit" />
          <EmptyTile icon="flame" label="Workout impact" hint="Auto from delta" />
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 28, padding: 22, borderRadius: 18,
          background: 'var(--ink)', color: 'var(--paper)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ArcaMark size={42} />
            <div>
              <div className="display" style={{ fontSize: 18, color: 'var(--paper)', letterSpacing: '-0.01em' }}>Start the vessel</div>
              <div style={{ fontSize: 12, color: 'rgba(244,239,230,0.65)' }}>Capture once. The rest fills in.</div>
            </div>
          </div>
          <button style={{
            background: 'var(--accent)', color: 'var(--paper)', border: 'none',
            padding: '14px 16px', borderRadius: 12, fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', boxShadow: 'var(--shadow-accent)', font: 'inherit',
          }}>
            <SysIcon name="image" size={16} color="var(--paper)" stroke={2} />
            Import a screenshot
          </button>
        </div>
      </div>
    </IOSAppShell>
  );
}
function EmptyTile({ icon, label, hint, span = 1 }) {
  return (
    <div style={{
      gridColumn: `span ${span}`,
      background: 'var(--surface-2)',
      border: '1px dashed var(--line)',
      borderRadius: 18, padding: 16,
      minHeight: 132, display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <SysIcon name={icon} size={14} color="var(--text-3)" />
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{label}</div>
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, color: 'var(--text-3)' }}>—</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 'auto' }}>{hint}</div>
    </div>
  );
}

// ── Surface 3: expanded module (Recovery detail) ──
function IOSCaptureDetail() {
  const rec = [62, 71, 58, 49, 65, 72, 78, 60, 55, 68, 74, 81, 76, 81];
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--paper)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui',
    }}>
      <div style={{
        padding: '60px 20px 18px',
        borderBottom: '1px solid var(--line-2)',
        background: 'rgba(244, 239, 230, 0.92)',
        backdropFilter: 'blur(12px)',
      }}>
        <button style={{
          border: 'none', background: 'transparent', color: 'var(--accent-deep)',
          fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4, font: 'inherit', cursor: 'pointer',
        }}>
          ← History
        </button>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--accent-deep)', textTransform: 'uppercase', marginBottom: 6 }}>Recovery</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <div className="num" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 56, color: 'var(--ink)', letterSpacing: '-0.04em', fontWeight: 500 }}>81</div>
          <div style={{ fontSize: 18, color: 'var(--text-2)' }}>%</div>
          <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: 'var(--ok)' }}>↑ +13 vs avg</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>This morning · Morpheus capture</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 16px 60px' }}>
        {/* Big sparkline */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 18, padding: '20px 16px 16px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 11, color: 'var(--text-3)' }}>
            <span>14 DAYS</span>
            <span>RANGE 49 — 81</span>
          </div>
          <Sparkline values={rec} color="var(--accent)" width={IOS_W - 64} height={140} fill />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
            <span>15 Apr</span>
            <span>22 Apr</span>
            <span>29 Apr</span>
          </div>
        </div>

        {/* Quick stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
          <Stat label="14-day avg" value="68" />
          <Stat label="Workouts" value="9" />
          <Stat label="Confidence" value="96%" />
        </div>

        {/* Entry list */}
        <div style={{ marginTop: 22, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--accent-deep)', textTransform: 'uppercase', padding: '4px 4px 8px' }}>
          Recent entries
        </div>
        {[
          { d: 'Today', v: 81, hrv: 62, sleep: '8h 06', tag: 'Strong' },
          { d: 'Mon, 28 Apr', v: 76, hrv: 56, sleep: '7h 42', tag: '' },
          { d: 'Sun, 27 Apr', v: 74, hrv: 50, sleep: '7h 18', tag: 'CrossFit −12%' },
          { d: 'Sat, 26 Apr', v: 68, hrv: 41, sleep: '6h 30', tag: '' },
          { d: 'Fri, 25 Apr', v: 55, hrv: 44, sleep: '6h 54', tag: 'Late night' },
        ].map((e, i) => (
          <div key={i} style={{
            background: 'var(--surface)', borderBottom: '1px solid var(--line-2)',
            padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 12,
            borderLeft: '1px solid var(--line)', borderRight: '1px solid var(--line)',
            borderTop: i === 0 ? '1px solid var(--line)' : 'none',
            borderRadius: i === 0 ? '14px 14px 0 0' : i === 4 ? '0 0 14px 14px' : 0,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{e.d}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>HRV {e.hrv} · Sleep {e.sleep}{e.tag && ` · ${e.tag}`}</div>
            </div>
            <div className="num" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: 'var(--ink)' }}>{e.v}<span style={{ fontSize: 11, color: 'var(--text-3)' }}>%</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
function Stat({ label, value }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</div>
      <div className="num" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: 'var(--ink)', marginTop: 4, letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}

Object.assign(window, { IOSCapturePopulated, IOSCaptureEmpty, IOSCaptureDetail });
