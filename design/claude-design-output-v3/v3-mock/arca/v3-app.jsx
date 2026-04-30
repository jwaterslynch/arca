// Arca v3 — Tweaks panel.
// Exposes the four variation axes the v3 brief asked us to argue:
//   - Practices density (rail dots size + spacing)
//   - AI bar position
//   - Stats density
//   - Depth/category tags on tasks (always vs hover)

const V3_DEFAULTS = /*EDITMODE-BEGIN*/{
  "practicesDensity": "default",
  "aiBarPosition": "above-list",
  "statsMode": "slim",
  "showDepthTags": false
}/*EDITMODE-END*/;

function ArcaV3App() {
  const [tweaks, setTweak] = useTweaks(V3_DEFAULTS);
  const cleanMode = new URLSearchParams(window.location.search).get('canvas') === '0';

  if (cleanMode) {
    return (
      <>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f0eee9' }}>
          <ExecuteV3 tweaks={tweaks} />
        </div>
        <TweaksPanel title="Tweaks">
          <TweakSection title="Practices rail">
            <TweakRadio label="Density" value={tweaks.practicesDensity}
              options={[{value:'tight',label:'Tight'},{value:'default',label:'Default'},{value:'spacious',label:'Spacious'}]}
              onChange={(v) => setTweak('practicesDensity', v)} />
          </TweakSection>
          <TweakSection title="AI bar">
            <TweakRadio label="Position" value={tweaks.aiBarPosition}
              options={[{value:'above-list',label:'Above list'},{value:'below-hero',label:'Below hero'},{value:'floating',label:'Floating'}]}
              onChange={(v) => setTweak('aiBarPosition', v)} />
          </TweakSection>
          <TweakSection title="Stats footer">
            <TweakRadio label="Mode" value={tweaks.statsMode}
              options={[{value:'slim',label:'Slim line'},{value:'cards',label:'Four cards'},{value:'hidden',label:'Hidden'}]}
              onChange={(v) => setTweak('statsMode', v)} />
          </TweakSection>
          <TweakSection title="Task tags">
            <TweakToggle label="Show DEEP / STRATEGIC always" checked={tweaks.showDepthTags}
              onChange={(v) => setTweak('showDepthTags', v)} />
          </TweakSection>
        </TweaksPanel>
      </>
    );
  }

  return (
    <>
      <DesignCanvas>
        <DCSection
          id="exec"
          title="Execute · v3 redesign"
          subtitle="Single column. Practices as a rail, not a panel. Figure / ground."
        >
          <DCArtboard id="exec-rest" label="At rest — what the user opens to" width={V3_W} height={V3_H}>
            <ExecuteV3 tweaks={tweaks} />
          </DCArtboard>
        </DCSection>

        <DCSection
          id="rationale"
          title="Rationale, rejected, open questions"
          subtitle="The tension answered. The cuts named. The handoff caveats flagged."
        >
          <DCArtboard id="v3-rationale" label="Rationale — figure / ground" width={1024} height={760}>
            <RationaleV3 />
          </DCArtboard>
          <DCArtboard id="v3-rejected" label="Considered and rejected" width={1024} height={760}>
            <RejectedV3 />
          </DCArtboard>
          <DCArtboard id="v3-questions" label="Open questions for engineering" width={1024} height={760}>
            <OpenQuestionsV3 />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Practices rail">
          <TweakRadio
            label="Density"
            value={tweaks.practicesDensity}
            options={[
              { value: 'tight',    label: 'Tight' },
              { value: 'default',  label: 'Default' },
              { value: 'spacious', label: 'Spacious' },
            ]}
            onChange={(v) => setTweak('practicesDensity', v)}
          />
        </TweakSection>

        <TweakSection title="AI bar">
          <TweakRadio
            label="Position"
            value={tweaks.aiBarPosition}
            options={[
              { value: 'above-list', label: 'Above list' },
              { value: 'below-hero', label: 'Below hero' },
              { value: 'floating',   label: 'Floating' },
            ]}
            onChange={(v) => setTweak('aiBarPosition', v)}
          />
        </TweakSection>

        <TweakSection title="Stats footer">
          <TweakRadio
            label="Mode"
            value={tweaks.statsMode}
            options={[
              { value: 'slim',   label: 'Slim line' },
              { value: 'cards',  label: 'Four cards' },
              { value: 'hidden', label: 'Hidden' },
            ]}
            onChange={(v) => setTweak('statsMode', v)}
          />
        </TweakSection>

        <TweakSection title="Task tags">
          <TweakToggle
            label="Show DEEP / STRATEGIC always"
            checked={tweaks.showDepthTags}
            onChange={(v) => setTweak('showDepthTags', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ArcaV3App />);
