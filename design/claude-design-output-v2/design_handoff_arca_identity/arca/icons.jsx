// Arca icons — single SVG mark in multiple treatments.
// The mark: a vault-arch "A" — two converging strokes from a four-pillar base
// to a bronze keystone. Reads as: A · arch · chest · keystone · ledger.

// ── ArcaMark: the canonical vector. Pass tokens for variants. ──
function ArcaMark({
  size = 256,
  rounding = 0.225,        // share of size used for icon corner radius
  bg = 'var(--ink)',
  bgGradient = true,
  stroke = '#f0e6d2',      // parchment
  apex = '#c9956b',         // bronze keystone
  apexGlow = true,
  strokeRatio = 0.062,      // line weight relative to size
  domainDots = false,       // four-domain marks at the base
  flat = false,             // for monochrome / favicon mode
  innerShadow = true,
  noBg = false,
  baseLine = true,
}) {
  const id = React.useId().replace(/:/g, '');
  const r = size * rounding;
  const sw = size * strokeRatio;
  const cx = size / 2;
  // Geometry — derived from a 1024-grid then scaled.
  // Apex slightly above center; base wide; cross-bar gives the "A".
  const G = (n) => (n / 1024) * size;
  const apexY = G(290);
  const apexR = G(34);
  const baseY = G(740);
  const leftX = G(298);
  const rightX = G(726);
  const crossY = G(580);
  const crossLX = G(412);
  const crossRX = G(612);

  // Slight inboard offset from the apex for the strokes (so the keystone
  // reads as separate from the strokes).
  const apexGap = G(28);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1a2740" />
          <stop offset="55%"  stopColor="#0f1822" />
          <stop offset="100%" stopColor="#0a1018" />
        </linearGradient>
        <linearGradient id={`stroke-${id}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"  stopColor="#f4ead6" />
          <stop offset="100%" stopColor="#d8c9ad" />
        </linearGradient>
        <radialGradient id={`apex-${id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%"  stopColor="#e3b685" />
          <stop offset="55%" stopColor={apex} />
          <stop offset="100%" stopColor="#8a5a2a" />
        </radialGradient>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#c9956b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c9956b" stopOpacity="0" />
        </radialGradient>
        <filter id={`inner-${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation={size * 0.012} />
          <feOffset dx="0" dy={size * 0.006} result="off" />
          <feFlood floodColor="#000" floodOpacity="0.4" />
          <feComposite in2="off" operator="in" />
          <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
        </filter>
      </defs>

      {/* Background tile */}
      {!noBg && (
        <g>
          <rect x="0" y="0" width={size} height={size} rx={r} ry={r}
                fill={bgGradient && !flat ? `url(#bg-${id})` : bg} />
          {/* Subtle vignette */}
          {!flat && (
            <rect x="0" y="0" width={size} height={size} rx={r} ry={r}
                  fill={`url(#glow-${id})`} opacity="0.35" />
          )}
          {/* Inner shadow rim (Tahoe-ish) */}
          {innerShadow && !flat && (
            <rect x="0" y="0" width={size} height={size} rx={r} ry={r}
                  fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * 0.006} />
          )}
        </g>
      )}

      {/* The mark */}
      <g strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Left rising stroke */}
        <line x1={leftX} y1={baseY} x2={cx - apexGap} y2={apexY + apexR * 0.6}
              stroke={flat ? stroke : `url(#stroke-${id})`} strokeWidth={sw} />
        {/* Right rising stroke */}
        <line x1={rightX} y1={baseY} x2={cx + apexGap} y2={apexY + apexR * 0.6}
              stroke={flat ? stroke : `url(#stroke-${id})`} strokeWidth={sw} />
        {/* Crossbar — the chest's lid line / ark's deck */}
        <line x1={crossLX} y1={crossY} x2={crossRX} y2={crossY}
              stroke={flat ? stroke : `url(#stroke-${id})`} strokeWidth={sw * 0.92} />
        {/* Base line — the ark's floor / four-domain rail */}
        {baseLine && (
          <line x1={leftX - G(10)} y1={baseY + sw * 0.6} x2={rightX + G(10)} y2={baseY + sw * 0.6}
                stroke={flat ? stroke : `url(#stroke-${id})`} strokeWidth={sw * 0.7} opacity={flat ? 0.75 : 0.85} />
        )}

        {/* Four-domain dots, optional */}
        {domainDots && [0.18, 0.395, 0.605, 0.82].map((t, i) => (
          <circle key={i} cx={leftX + (rightX - leftX) * t} cy={baseY + sw * 0.6}
                  r={sw * 0.28} fill={apex} opacity="0.78" stroke="none" />
        ))}
      </g>

      {/* Apex keystone — the vessel's contents */}
      {apexGlow && !flat && (
        <circle cx={cx} cy={apexY} r={apexR * 1.9} fill={`url(#glow-${id})`} />
      )}
      <circle cx={cx} cy={apexY} r={apexR}
              fill={flat ? apex : `url(#apex-${id})`} />
    </svg>
  );
}

// ── Glyph-only (no tile) for use inside UI ──
function ArcaGlyph({ size = 32, color = 'currentColor', accent = '#c9956b' }) {
  return <ArcaMark size={size} noBg={true} flat={true} stroke={color} apex={accent} apexGlow={false} innerShadow={false} bgGradient={false} />;
}

// ── Wordmark lockup ──
function ArcaWordmark({ size = 56, color = 'var(--ink)', accent = '#b07a3e', tracking = 0.18 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}>
      <ArcaMark size={size} rounding={0.22} />
      <span style={{
        fontFamily: "'Fraunces', Georgia, serif",
        fontWeight: 500,
        fontSize: size * 0.78,
        letterSpacing: `${tracking}em`,
        color,
        textTransform: 'uppercase',
        lineHeight: 1,
        marginLeft: size * 0.02,
        paddingTop: size * 0.04,
      }}>
        Arca
      </span>
    </div>
  );
}

// ── In-app system icons (Lucide-style strokes, custom set) ──
function SysIcon({ name, size = 20, stroke = 1.6, color = 'currentColor' }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
              stroke: color, strokeWidth: stroke, strokeLinecap: 'round',
              strokeLinejoin: 'round', style: { display: 'block' } };
  switch (name) {
    case 'execute': return (
      <svg {...p}><path d="M5 4v16M5 4l13 8-13 8" /></svg>
    );
    case 'plan': return (
      <svg {...p}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>
    );
    case 'health': return (
      <svg {...p}><path d="M3 12h4l2-5 4 10 2-5h6" /></svg>
    );
    case 'wealth': return (
      <svg {...p}><path d="M4 19V8l8-5 8 5v11" /><path d="M9 19v-7h6v7" /></svg>
    );
    case 'wise': return (
      <svg {...p}><path d="M4 5h11a4 4 0 0 1 4 4v10a3 3 0 0 0-3-3H4z" /><path d="M4 5v14" /></svg>
    );
    case 'capture': return (
      <svg {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><circle cx="12" cy="12.5" r="3.2" /><path d="M8 6l1.5-2h5L16 6" /></svg>
    );
    case 'history': return (
      <svg {...p}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 7v5l3 2" /></svg>
    );
    case 'plus':    return (<svg {...p}><path d="M12 5v14M5 12h14" /></svg>);
    case 'check':   return (<svg {...p}><path d="M4 12.5l5 5L20 6.5" /></svg>);
    case 'play':    return (<svg {...p}><path d="M7 5l12 7-12 7z" fill={color} stroke="none" /></svg>);
    case 'pause':   return (<svg {...p}><rect x="6" y="5" width="4" height="14" rx="1" fill={color} stroke="none" /><rect x="14" y="5" width="4" height="14" rx="1" fill={color} stroke="none" /></svg>);
    case 'arrow':   return (<svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
    case 'spark':   return (<svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" /></svg>);
    case 'moon':    return (<svg {...p}><path d="M20 14a8 8 0 1 1-9.5-9.5A6 6 0 0 0 20 14z" /></svg>);
    case 'scale':   return (<svg {...p}><path d="M5 7h14l-2 12H7z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>);
    case 'heart':   return (<svg {...p}><path d="M12 19s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 9c0 5.5-7 10-7 10z" /></svg>);
    case 'flame':   return (<svg {...p}><path d="M12 3c1 4 5 5 5 9a5 5 0 1 1-10 0c0-2 1-3 2-4-1 3 1 4 1 4 0-3 1-5 2-9z" /></svg>);
    case 'dot':     return (<svg {...p}><circle cx="12" cy="12" r="2" fill={color} stroke="none" /></svg>);
    case 'mic':     return (<svg {...p}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 12a7 7 0 0 0 14 0M12 19v3" /></svg>);
    case 'image':   return (<svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></svg>);
    case 'book':    return (<svg {...p}><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" /><path d="M4 5v16" /></svg>);
    default:        return null;
  }
}

Object.assign(window, { ArcaMark, ArcaGlyph, ArcaWordmark, SysIcon });
