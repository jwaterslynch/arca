// Arca v3 — Native focus mode.
//
// The redesign: focus mode is not an overlay that mirrors the hero timer.
// It IS the timer. When entered, the focus surface mounts and owns the
// timer state (elapsed, remaining, sessionN). When exited, state hands
// back to the hero card via callback. Single source of truth.
//
// Interaction model:
//   - Esc exits (returns to hero with state preserved)
//   - Click "Done" closes the session and fires session-closed beat
//   - Spacebar pause/resume
//   - First mouse move shows controls; idle 2s hides cursor + controls
//   - Music pill bottom-right; minimal, optional
//   - prefers-reduced-motion: skips the 480ms fade-in

function FocusModeV3({ task, onExit, initialElapsed = 768 /* 12:48 */ }) {
  const [elapsed, setElapsed] = React.useState(initialElapsed);
  const [paused, setPaused] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const [showSessionBeat, setShowSessionBeat] = React.useState(false);
  const idleTimer = React.useRef(null);
  const TOTAL = 25 * 60;

  // Tick the timer
  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setElapsed(e => {
        if (e >= TOTAL) {
          clearInterval(t);
          setShowSessionBeat(true);
          return TOTAL;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [paused]);

  // Idle detection — hide cursor + controls after 2s of stillness
  React.useEffect(() => {
    const onMove = () => {
      setShowControls(true);
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setShowControls(false), 2000);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') onExit();
      if (e.key === ' ') { e.preventDefault(); setPaused(p => !p); }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('keydown', onKey);
    onMove(); // start the timer
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('keydown', onKey);
      clearTimeout(idleTimer.current);
    };
  }, [onExit]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const remaining = Math.max(0, TOTAL - elapsed);
  const pct = (elapsed / TOTAL) * 100;

  // Session beat ends → exit
  if (showSessionBeat) {
    return <SessionClosedBeatV3 duration={fmt(TOTAL)} onDone={onExit} />;
  }

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'radial-gradient(ellipse at 50% 30%, #1a2740 0%, #0f1822 50%, #0a1018 100%)',
        cursor: showControls ? 'default' : 'none',
        display: 'grid', gridTemplateRows: 'auto 1fr auto',
        padding: '40px 56px',
        animation: 'focusFadeIn 480ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Top: mark + hint (controls fade with idle) */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: showControls ? 1 : 0, transition: 'opacity 360ms',
      }}>
        <div style={{ color: 'var(--paper)' }}>
          <ArcaMark size={48} />
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.16em',
          color: 'rgba(244,239,230,0.4)', textTransform: 'uppercase',
        }}>
          Focus · session 1 of 4 · esc to exit
        </div>
      </header>

      {/* Center: timer + task */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: 128,
          color: paused ? 'rgba(244,239,230,0.5)' : 'var(--paper)',
          letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
          textShadow: '0 0 60px rgba(176,122,62,0.15)',
          transition: 'color 240ms ease-out',
        }}>
          {fmt(elapsed)}
        </div>
        <div className="display" style={{
          fontSize: 22, color: 'rgba(244,239,230,0.65)',
          fontWeight: 400, letterSpacing: '-0.01em',
          maxWidth: 600, textAlign: 'center',
          textWrap: 'balance',
        }}>
          {task?.title ?? 'No task selected'}
        </div>
        {paused && (
          <div style={{
            fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.18em',
            color: 'var(--accent-2)', textTransform: 'uppercase',
            animation: 'pulseSubtle 1800ms ease-in-out infinite',
          }}>
            Paused · space to resume
          </div>
        )}
      </div>

      {/* Bottom: progress + controls */}
      <footer style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(244,239,230,0.12)', position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 0, width: `${pct}%`,
              background: 'var(--accent)',
              transition: 'width 1000ms linear',
            }} />
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(244,239,230,0.4)',
            letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', minWidth: 110, textAlign: 'right',
          }}>
            {fmt(remaining)} remaining
          </div>
        </div>

        {/* Controls — fade with idle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          opacity: showControls ? 1 : 0, transition: 'opacity 360ms', pointerEvents: showControls ? 'auto' : 'none',
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <FocusBtn label={paused ? 'Resume' : 'Pause'} onClick={() => setPaused(p => !p)} />
            <FocusBtn label="Done" onClick={() => setShowSessionBeat(true)} />
            <FocusBtn label="Exit" onClick={onExit} ghost />
          </div>

          {/* Music pill */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 999,
            background: 'rgba(244,239,230,0.06)', border: '1px solid rgba(244,239,230,0.12)',
            color: 'rgba(244,239,230,0.6)', cursor: 'pointer',
            fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.04em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
            Brown noise
          </button>
        </div>
      </footer>
    </div>
  );
}

function FocusBtn({ label, onClick, ghost = false }) {
  return (
    <button onClick={onClick} style={{
      background: ghost ? 'transparent' : 'rgba(244,239,230,0.08)',
      color: 'rgba(244,239,230,0.85)',
      border: '1px solid rgba(244,239,230,0.12)',
      padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
      fontFamily: 'Inter', fontSize: 12, letterSpacing: '0.02em',
      transition: 'background 160ms',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244,239,230,0.14)'}
    onMouseLeave={(e) => e.currentTarget.style.background = ghost ? 'transparent' : 'rgba(244,239,230,0.08)'}
    >
      {label}
    </button>
  );
}

// ─── Session Closed Beat (v3 native — owned by FocusMode) ───
function SessionClosedBeatV3({ duration, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 1400);
    const skip = () => { clearTimeout(t); onDone(); };
    window.addEventListener('keydown', skip);
    window.addEventListener('mousedown', skip);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('mousedown', skip);
    };
  }, [onDone]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 110,
      background: '#0f1822',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
      animation: 'sessionFade 1400ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
    }}>
      <div style={{
        animation: 'markDrawIn 700ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        opacity: 0, color: 'var(--paper)',
      }}>
        <ArcaMark size={96} />
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono', fontSize: 14, letterSpacing: '0.18em',
        color: 'rgba(244,239,230,0.55)', textTransform: 'uppercase',
        opacity: 0,
        animation: 'metaFadeIn 500ms ease-out 400ms forwards',
      }}>
        {duration} · session closed
      </div>
    </div>
  );
}

Object.assign(window, { FocusModeV3, SessionClosedBeatV3 });
