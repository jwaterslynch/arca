// Landing / wordmark moment + rationale.

function ArcaLanding() {
  return (
    <div className="ab" style={{
      width: 1280, minHeight: 720,
      background: 'var(--paper)',
      backgroundImage: 'radial-gradient(900px 500px at 12% -10%, rgba(176,122,62,0.10) 0%, transparent 60%), radial-gradient(700px 400px at 95% 110%, rgba(15,24,34,0.06) 0%, transparent 60%)',
      padding: '56px 64px',
      fontFamily: 'Inter, system-ui',
      borderRadius: 14, overflow: 'hidden',
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 80 }}>
        <ArcaWordmark size={28} />
        <div style={{ display: 'flex', gap: 28, fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>
          <span>Why</span><span>Privacy</span><span>Changelog</span>
          <span style={{ color: 'var(--accent-deep)', fontWeight: 600 }}>Download</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 56, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent-deep)', marginBottom: 18 }}>
            Local-first · macOS · Alpha
          </div>
          <div className="display" style={{ fontSize: 64, color: 'var(--ink)', lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 22 }}>
            A vessel for the<br/>life you're building.
          </div>
          <div style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.55, maxWidth: 520, marginBottom: 32 }}>
            Arca is a personal operating system — focus, health, wealth, and what makes the rest worth doing. Captured locally. Reflected on slowly.
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ background: 'var(--accent)', color: 'var(--paper)', border: 'none', padding: '14px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-accent)', cursor: 'pointer' }}>Download for macOS</button>
            <button style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)', padding: '14px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Read the brief →</button>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 40, fontSize: 12, color: 'var(--text-2)' }}>
            <FourPillar hue="var(--d-execute)" label="Execute" sub="Focus · time · review" />
            <FourPillar hue="var(--d-health)"  label="Health"  sub="Body · recovery · sleep" />
            <FourPillar hue="var(--d-wealth)"  label="Wealth"  sub="Net worth · cash · super" />
            <FourPillar hue="var(--d-wise)"    label="Wise"    sub="Read · meditate · grow" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ borderRadius: 64, boxShadow: '0 40px 80px rgba(15,24,34,0.25), 0 0 0 1px rgba(15,24,34,0.04)' }}>
            <ArcaMark size={300} domainDots={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
function FourPillar({ hue, label, sub }) {
  return (
    <div>
      <div style={{ width: 24, height: 2, background: hue, marginBottom: 8 }} />
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Rationale() {
  return (
    <div className="ab" style={{
      width: 1280, padding: '48px 64px',
      background: 'var(--surface)',
      fontFamily: 'Inter, system-ui',
      borderRadius: 14,
      minHeight: 720,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-deep)', marginBottom: 14 }}>One-page rationale</div>
      <div className="display" style={{ fontSize: 44, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 36, maxWidth: 900 }}>
        What Arca was supposed to feel like.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, fontSize: 14, lineHeight: 1.65, color: 'var(--text)' }}>
        <div>
          <H>The icon</H>
          <p>The mark is a synthesis: an <b>A</b> whose strokes converge to a bronze <b>keystone</b>, rising from a four-pillar <b>base</b>. Read at any size as A · arch · chest · keystone · ledger. The vault metaphor is earned, not literal — there's no chest, no keyhole, no rivets.</p>
          <p>I rejected the bare lettermark (the green-A in production failed for the same reason — a letter alone has no ownership), the literal strongbox (too noun-y, doesn't scale), and the nested arches (reads as 'church' before it reads as 'A'). The vault-arch survives 16px because two strokes and a dot is the bottom of the visual stack.</p>

          <H>The palette</H>
          <p>The prior icon-folder direction was right, the production app was wrong. Cool gray-green and bright productivity green made Arca read like <em>another web app</em>. The new system is <b>warm parchment, deep navy ink, single bronze accent.</b> Domain hues — slate, moss, bronze, aubergine — are deeply muted; they appear only as tab indicators and sparkline tints. Surfaces stay paper. The accent stays bronze.</p>

          <H>The type</H>
          <p>Inter for body, <b>Fraunces</b> for headings (a contemporary humanist serif — Tufte-adjacent without being dusty), <b>JetBrains Mono</b> for numerics. Numbers are tabular everywhere money or weight or time is shown. The wordmark is Fraunces, sentence-cased with wide tracking — the name carries weight; the type should too.</p>
        </div>

        <div>
          <H>The four-domain answer</H>
          <p>The IA framing isn't wrong, but it can't be carried by tab labels alone. So it's encoded structurally: four pillars at the base of the icon, four muted hues on tab spines (never as fills), and a sidebar that groups the two operating tabs (Execute/Plan) above the three life dashboards (Health/Wealth/Wise). The domains never compete for the accent — only bronze is bronze.</p>

          <H>The iOS Capture surface</H>
          <p>The current long-scrolling List of charts feels like a CRM dashboard because it <em>is</em> one. The fix: a calm <b>tile grid</b> grouped by Body composition / Recovery / Workouts. Each tile is one number, one sparkline, one delta. Tap to expand into a full chart + entry list. The empty state is a single CTA — <em>start the vessel</em> — not a wall of dashed cards.</p>

          <H>The desktop home</H>
          <p>Same hero timer + today's tasks shape, new identity. The sidebar grows from 3 tabs to 5 without crowding because Operate (Execute / Plan) and Life (Health / Wealth / Wise) are visually grouped. Tasks carry a domain pill so the user can see <em>where</em> their time is going — not just how much.</p>

          <H>What I'd want Julian to push back on</H>
          <p>Whether <b>Fraunces</b> earns its place over a single-family Inter system. Whether the keystone bronze should be a touch warmer (closer to amber). Whether the domain-pill on tasks adds value or just noise.</p>
        </div>
      </div>
    </div>
  );
}
function H({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-deep)', marginTop: 18, marginBottom: 8 }}>{children}</div>;
}

Object.assign(window, { ArcaLanding, Rationale });
