// Top-level app — assemble the design canvas.

function App() {
  return (
    <DesignCanvas>
      <DCSection id="icon" title="Icon family" subtitle="Recommended mark, scale tests, monochrome, wordmark">
        <DCArtboard id="icon-family" label="Vault-arch · master + scale + variants" width={1280} height={1180}>
          <IconFamily />
        </DCArtboard>
      </DCSection>

      <DCSection id="identity" title="Visual identity" subtitle="Color, type, depth — the system behind the icon">
        <DCArtboard id="tokens" label="Tokens · ink, paper, bronze" width={1280} height={1100}>
          <IdentityTokens />
        </DCArtboard>
      </DCSection>

      <DCSection id="ios" title="iOS Capture · tile grid" subtitle="Replaces the long-scroll list. Empty · Populated · Expanded module">
        <DCArtboard id="ios-empty" label="Empty state — start the vessel" width={IOS_W} height={IOS_H}>
          <IOSDevice width={IOS_W} height={IOS_H}>
            <IOSCaptureEmpty />
          </IOSDevice>
        </DCArtboard>
        <DCArtboard id="ios-populated" label="Populated — calm tile grid" width={IOS_W} height={IOS_H}>
          <IOSDevice width={IOS_W} height={IOS_H}>
            <IOSCapturePopulated />
          </IOSDevice>
        </DCArtboard>
        <DCArtboard id="ios-detail" label="Recovery detail — expanded module" width={IOS_W} height={IOS_H}>
          <IOSDevice width={IOS_W} height={IOS_H}>
            <IOSCaptureDetail />
          </IOSDevice>
        </DCArtboard>
      </DCSection>

      <DCSection id="desktop" title="Desktop · Execute home" subtitle="Same density, new identity. Five-tab sidebar grouped Operate / Life">
        <DCArtboard id="desktop-execute" label="Execute — mid-sprint" width={DESK_W} height={DESK_H}>
          <DesktopExecute />
        </DCArtboard>
      </DCSection>

      <DCSection id="landing" title="Landing & rationale" subtitle="Wordmark in context · one-page why">
        <DCArtboard id="landing" label="arca.app — hero" width={1280} height={720}>
          <ArcaLanding />
        </DCArtboard>
        <DCArtboard id="rationale" label="One-page rationale" width={1280} height={720}>
          <Rationale />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
