// Identity artboards: type scale, color tokens, icon family, depth.

const IDENTITY_W = 1280;

// ─── Card / Section helpers ───
function Sect({ title, kicker, children, style }) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-md)',
      padding: 32,
      ...style,
    }}>
      {kicker && (
        <div style={{
          textTransform: 'uppercase',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: 'var(--accent-deep)',
          marginBottom: 12,
        }}>{kicker}</div>
      )}
      {title && <div className="display" style={{ fontSize: 28, color: 'var(--ink)', marginBottom: 22 }}>{title}</div>}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────
// Icon family — the recommended mark + sizes + variants
// ─────────────────────────────────────────
function IconFamily() {
  return (
    <div className="ab" style={{ width: IDENTITY_W, padding: 40, background: 'var(--paper)', minHeight: 880 }}>
      <Header
        kicker="Priority 1 · Icon family"
        title="The vault-arch A"
        sub="A rises from a four-pillar base to a bronze keystone. Read at any size as: A · arch · chest · keystone. Etymology earned, not literal."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 28 }}>
        {/* Hero icon */}
        <Sect kicker="MASTER · 1024px" title="" style={{ padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 24,
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-lg)',
            padding: 56,
            display: 'flex', justifyContent: 'center',
          }}>
            <div style={{ borderRadius: 80, boxShadow: 'var(--shadow-icon)' }}>
              <ArcaMark size={360} domainDots={true} />
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <Tag>Latin: <i>arca</i> = chest, vessel</Tag>
            <Tag>Apex = the precious thing held</Tag>
            <Tag>Base = four domains</Tag>
          </div>
        </Sect>

        {/* Right column: scale, light/dark, mono */}
        <div style={{ display: 'grid', gap: 20, gridTemplateRows: 'auto auto auto' }}>
          <Sect kicker="SCALE TEST · 16 → 256" title="">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28 }}>
              {[16, 24, 32, 48, 64, 96, 128].map(s => (
                <div key={s} style={{ textAlign: 'center' }}>
                  <div style={{ borderRadius: s * 0.225, overflow: 'hidden' }}>
                    <ArcaMark size={s} domainDots={s >= 96} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{s}px</div>
                </div>
              ))}
            </div>
          </Sect>

          <Sect kicker="iOS 18 · MONOCHROME / TINTED" title="">
            <div style={{ display: 'flex', gap: 18 }}>
              <IconTile bg="#000" stroke="#fff" apex="#fff">Dark</IconTile>
              <IconTile bg="#fff" stroke="#0f1822" apex="#0f1822">Light</IconTile>
              <IconTile bg="linear-gradient(135deg,#3f5878 0%,#1f3552 100%)" stroke="#dde6f0" apex="#dde6f0">Tinted</IconTile>
              <IconTile bg="linear-gradient(135deg,#b07a3e 0%,#6e4a26 100%)" stroke="#f4ead6" apex="#f4ead6">Bronze</IconTile>
            </div>
          </Sect>

          <Sect kicker="WORDMARK" title="">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'flex-start' }}>
              <ArcaWordmark size={56} />
              <ArcaWordmark size={36} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '14px 22px', background: 'var(--ink)', borderRadius: 14 }}>
                <ArcaMark size={36} />
                <span className="display" style={{ color: 'var(--paper)', fontSize: 28, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>Arca</span>
              </div>
            </div>
          </Sect>
        </div>
      </div>

      {/* Why this, not lettermark/strongbox/arch */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
        <RejectedCard title="Lettermark only" verdict="Rejected" reason="A bare A on a navy field has no ownership — it could be Anything. The current green-A failed for the same reason." />
        <RejectedCard title="Literal strongbox" verdict="Rejected" reason="A chest with a keyhole is too noun-y. The icon becomes a metaphor before it becomes a symbol. Does not scale to 16px." />
        <RejectedCard title="Nested arches" verdict="Rejected" reason="Reads as 'church' or 'museum' before it reads as 'A'. Loses identity below 32px." />
        <RecommendedCard title="Vault-arch synthesis" reason="The strokes ARE the arch. The keystone IS the precious thing. The base IS the four domains. One mark, four meanings, scales to 16px." />
      </div>
    </div>
  );
}

function IconTile({ bg, stroke, apex, children }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 18,
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-md)',
      }}>
        <ArcaMark size={80} flat={true} stroke={stroke} apex={apex} bg="transparent" bgGradient={false} apexGlow={false} innerShadow={false} noBg={true} baseLine={true} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 8, fontWeight: 600 }}>{children}</div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span style={{
      fontSize: 12, color: 'var(--text-2)',
      background: 'var(--surface-2)', padding: '6px 12px',
      borderRadius: 999, border: '1px solid var(--line)',
    }}>{children}</span>
  );
}

function Header({ kicker, title, sub }) {
  return (
    <div>
      <div style={{
        textTransform: 'uppercase', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
        color: 'var(--accent-deep)', marginBottom: 12,
      }}>{kicker}</div>
      <div className="display" style={{ fontSize: 56, color: 'var(--ink)', lineHeight: 1.05, marginBottom: 14, maxWidth: 900 }}>{title}</div>
      {sub && <div style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.55, maxWidth: 720 }}>{sub}</div>}
    </div>
  );
}

function RejectedCard({ title, verdict, reason }) {
  return (
    <div style={{ padding: 18, border: '1px dashed var(--line)', borderRadius: 12, background: 'rgba(255,255,255,0.4)' }}>
      <div style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{verdict}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{reason}</div>
    </div>
  );
}
function RecommendedCard({ title, reason }) {
  return (
    <div style={{ padding: 18, border: '1px solid var(--accent)', borderRadius: 12, background: 'var(--accent-soft)' }}>
      <div style={{ fontSize: 11, color: 'var(--accent-deep)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Recommended</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>{reason}</div>
    </div>
  );
}

// ─────────────────────────────────────────
// Color & Type tokens
// ─────────────────────────────────────────
function IdentityTokens() {
  return (
    <div className="ab" style={{ width: IDENTITY_W, padding: 40, background: 'var(--paper)', minHeight: 880 }}>
      <Header
        kicker="Priority 2 · Visual identity"
        title="Ink, paper, bronze."
        sub="Warm parchment instead of cool gray. Deep navy ink instead of pure black. A single bronze accent that earns its place. Domain hues are deeply muted — never a rainbow."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, marginTop: 28 }}>
        <Sect kicker="CORE PALETTE" title="">
          <Swatch name="ink"      hex="#0F1822" notes="Body text · icon bg" fg="#f4efe6" />
          <Swatch name="ink-2"    hex="#1A2532" notes="Sidebar / chrome"     fg="#f4efe6" />
          <Swatch name="paper"    hex="#F4EFE6" notes="App background"       fg="#0f1822" />
          <Swatch name="surface"  hex="#FDFBF6" notes="Card surface"         fg="#0f1822" />
          <Swatch name="surface-2"hex="#F7F1E5" notes="Inset · empty"        fg="#0f1822" />
          <Swatch name="accent"   hex="#B07A3E" notes="Primary action · key" fg="#f4efe6" />
          <Swatch name="accent-2" hex="#C9956B" notes="Hover · keystone"     fg="#0f1822" />
          <Swatch name="accent-deep" hex="#8A5A2A" notes="Pressed · eyebrow" fg="#f4efe6" />
        </Sect>

        <div style={{ display: 'grid', gap: 20 }}>
          <Sect kicker="DOMAIN HUES" title="">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <DomainSwatch name="Execute" hex="#2F4A5C" />
              <DomainSwatch name="Health"  hex="#5A6B3A" />
              <DomainSwatch name="Wealth"  hex="#8A5A2A" />
              <DomainSwatch name="Wise"    hex="#4A3A5C" />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 14, lineHeight: 1.55 }}>
              Each domain has a single muted hue used <em>only</em> for tab indicators, sparkline tints, and category dots. Surfaces stay paper. The accent stays bronze.
            </div>
          </Sect>

          <Sect kicker="SEMANTIC" title="">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Pill bg="#a94032" fg="#fff">danger #A94032</Pill>
              <Pill bg="#b07a3e" fg="#fff">warn #B07A3E</Pill>
              <Pill bg="#4a6b3a" fg="#fff">ok #4A6B3A</Pill>
            </div>
          </Sect>

          <Sect kicker="DEPTH" title="">
            <div style={{ display: 'flex', gap: 14 }}>
              <DepthChip label="sm" shadow="var(--shadow-sm)" />
              <DepthChip label="md" shadow="var(--shadow-md)" />
              <DepthChip label="lg" shadow="var(--shadow-lg)" />
              <DepthChip label="icon" shadow="var(--shadow-icon)" dark />
              <DepthChip label="accent" shadow="var(--shadow-accent)" />
            </div>
          </Sect>
        </div>
      </div>

      {/* Type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginTop: 24 }}>
        <Sect kicker="TYPE · INTER + FRAUNCES + JETBRAINS MONO" title="">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TypeRow size={52} family="Fraunces" weight={500} tracking="-0.02em">Display · Quiet, considered</TypeRow>
            <TypeRow size={32} family="Fraunces" weight={500} tracking="-0.02em">Heading · The week ahead</TypeRow>
            <TypeRow size={20} family="Inter"    weight={700} tracking="-0.01em">H3 · Today's focus</TypeRow>
            <TypeRow size={15} family="Inter"    weight={500} tracking="0">Body · Most goals fail not because of bad planning but because the day-to-day crowds them out.</TypeRow>
            <TypeRow size={13} family="Inter"    weight={500} tracking="0" color="var(--text-2)">Caption · Captured 2 minutes ago · Arboleaf screenshot</TypeRow>
            <TypeRow size={11} family="Inter"    weight={700} tracking="0.14em" color="var(--accent-deep)" upper>Eyebrow · today</TypeRow>
            <TypeRow size={28} family="JetBrains Mono" weight={500} tracking="0" tnum>72.4 <span style={{ color: 'var(--text-3)', fontSize: 16, marginLeft: 6 }}>kg</span></TypeRow>
          </div>
        </Sect>

        <Sect kicker="ACCENT STRATEGY" title="">
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: 'var(--text)', lineHeight: 1.55 }}>
            <Li><b>Bronze appears only:</b> on the keystone, the primary CTA, the active timer ring, and the eyebrow kicker.</Li>
            <Li><b>Domain hues</b> appear only as tab indicators, sparkline strokes, and category dots — never as fills.</Li>
            <Li><b>No gradients on UI surfaces.</b> Gradients live exclusively inside the icon tile.</Li>
            <Li><b>Numbers are tabular</b> (JetBrains Mono or Inter <span className="mono">tnum</span>) — money, weight, time, recovery.</Li>
            <Li><b>Headings are Fraunces.</b> Body is Inter. Mono for data.</Li>
          </ul>
        </Sect>
      </div>
    </div>
  );
}

function Swatch({ name, hex, notes, fg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 14, marginBottom: 8 }}>
      <div style={{ width: 88, height: 56, background: hex, borderRadius: 10, border: '1px solid var(--line)',
                    display: 'flex', alignItems: 'flex-end', padding: 6, color: fg, fontSize: 11, fontWeight: 600 }}>
        {hex}
      </div>
      <div style={{ flex: 1, paddingTop: 4 }}>
        <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>--{name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{notes}</div>
      </div>
    </div>
  );
}
function DomainSwatch({ name, hex }) {
  return (
    <div>
      <div style={{ height: 64, background: hex, borderRadius: 8, marginBottom: 8 }} />
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{name}</div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{hex}</div>
    </div>
  );
}
function Pill({ bg, fg, children }) {
  return <div style={{ background: bg, color: fg, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{children}</div>;
}
function DepthChip({ label, shadow, dark }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 14, background: dark ? 'var(--ink)' : 'var(--surface)', boxShadow: shadow, border: '1px solid var(--line-2)' }} />
      <div className="mono" style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 8 }}>--shadow-{label}</div>
    </div>
  );
}
function TypeRow({ size, family, weight, tracking, color = 'var(--ink)', upper, tnum, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, paddingBottom: 10, borderBottom: '1px solid var(--line-2)' }}>
      <div style={{
        fontSize: size, fontFamily: family + ', system-ui', fontWeight: weight, letterSpacing: tracking,
        color, textTransform: upper ? 'uppercase' : 'none',
        fontVariantNumeric: tnum ? 'tabular-nums' : 'normal',
        flex: 1, lineHeight: 1.2,
      }}>{children}</div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
        {family} · {weight} · {size}px
      </div>
    </div>
  );
}
function Li({ children }) {
  return (
    <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--accent)', marginTop: 8, flexShrink: 0 }} />
      <span>{children}</span>
    </li>
  );
}

Object.assign(window, { IconFamily, IdentityTokens, Sect, Header });
