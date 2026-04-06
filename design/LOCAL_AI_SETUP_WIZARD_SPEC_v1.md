# Local AI Setup Wizard Spec v1

Date: 2026-03-13  
Product: Arca  
Status: Proposed  
Scope: Upgrade the current manual Ollama setup flow into a guided in-app setup wizard.

## 1. Why this exists

Arca already supports Ollama as a first-class AI provider and includes:

- an Ollama provider option
- a manual setup panel in onboarding
- a copyable `ollama pull ...` command
- a `Test Ollama Connection` button
- automatic provider configuration once models are detected

That is enough for technical users, but it is still a manual, terminal-oriented setup.

The next UX step is a `Local AI Setup Wizard` that:

- detects whether Ollama is installed and reachable
- opens the correct install page when it is missing
- lists installed local models
- lets the user pull a recommended model from inside the app
- shows pull/download progress
- finishes by configuring Arca to use the selected local model

This should make local/private AI feel like a first-class product path, not an expert-only side route.

## 2. Product goals

Primary goals:

- Make local AI setup understandable for non-technical users
- Reduce terminal usage to an optional fallback, not the default path
- Preserve Arca's privacy posture by making the local path explicit and easy
- Reuse the existing AI provider model and settings flow, not replace it

Non-goals for v1:

- managing every Ollama server setting
- handling remote Ollama hosts
- benchmarking model quality automatically
- downloading arbitrary models from user-entered strings
- supporting every local runner, e.g. LM Studio, llama.cpp, etc.

## 3. User-facing flow

The wizard should be reachable from:

- onboarding Step 2 AI provider selection
- AI settings panel when provider = `ollama`
- any privacy gate that recommends local analysis, e.g. `Wealth Coach`

### Step A: Detect

The wizard opens and immediately probes local Ollama state.

Possible outcomes:

1. `Not installed or not running`
2. `Installed and running, no models available`
3. `Installed and running, one or more models available`

The UI should show one primary action based on the detected state.

### Step B: Install

If Ollama is missing:

- show a short explanation: `Local AI runs on your machine. Nothing leaves your computer.`
- show an `Install Ollama` button
- clicking it opens the official Ollama download page in the default browser
- show a secondary fallback section with the terminal command if the user wants it

The app should not pretend it can silently install Ollama itself.

### Step C: Start / Recheck

After installation:

- the user clicks `Check Again`
- if Ollama is installed but the local API is still unreachable, the UI shows:
  - `Ollama is installed but not responding`
  - brief instruction to open the Ollama app / menubar agent
  - `Check Again`

### Step D: Choose a model

If Ollama is reachable but no models are installed:

- show recommended models with short descriptions
- each model has one primary CTA: `Download`
- default recommendations:
  - `llama4-scout` for best quality if the machine can handle it
  - `qwen3:8b` as a lighter general-purpose model
  - `deepseek-r1:8b` as a local reasoning-heavy option

The UI should not expose the full Ollama library first. Curated defaults are better.

### Step E: Download progress

While a model is being pulled:

- show model name
- show current status text, e.g. `Pulling layers...`
- show progress bar if total and completed bytes are available
- show a `Cancel` button if supported cleanly
- keep a `Run in Terminal instead` fallback visible

### Step F: Ready

When at least one model is available:

- show installed models
- let the user choose the default model
- configure Arca automatically:
  - `provider = ollama`
  - `baseUrl = http://localhost:11434/v1`
  - `model = selected model`
  - `apiKey = ""`
  - `enabled = true`
- show a final state:
  - `Ready`
  - `All requests stay on this machine while Ollama is active`

## 4. UX states

The wizard should use a simple state machine.

```text
idle
-> detecting
-> missing
-> installed_not_running
-> running_no_models
-> pulling_model
-> ready
-> error
```

Each state should render one clear primary action.

### Missing

Primary:

- `Install Ollama`

Secondary:

- `Check Again`

### Installed but not running

Primary:

- `Check Again`

Secondary:

- `Open Ollama`
- `Manual setup instructions`

### Running, no models

Primary:

- `Download llama4-scout`

Secondary:

- `Download qwen3:8b`
- `Download deepseek-r1:8b`

### Pulling

Primary:

- progress only

Secondary:

- `Cancel` if stable
- `Open Terminal fallback`

### Ready

Primary:

- `Use Ollama`

Secondary:

- `Change Model`
- `Run Test Prompt`

## 5. Technical approach

The key design choice:

- use the local Ollama HTTP API for detection and model pulls
- use a browser opener only for installation
- do not make CLI shell execution the primary setup path

Reason:

- the HTTP API is cleaner
- it works whether Ollama was installed via app or package manager
- it gives structured progress events for model pulls
- it avoids shell-command UX and quoting issues

## 6. Required APIs

### Install / website

Use Tauri opener to launch the official Ollama download page:

- `https://ollama.com/download`

### Local reachability / installed models

Probe Ollama locally:

- `GET http://localhost:11434/api/tags`

This returns installed models and is the best `ready/not-ready` check.

### Model pull

Start an in-app model download with:

- `POST http://localhost:11434/api/pull`

Request body example:

```json
{
  "name": "qwen3:8b",
  "stream": true
}
```

The response is a stream of JSON progress events.

### Optional model info

If needed later:

- `POST /api/show`
- `POST /api/delete`

These are not required for v1.

## 7. Arca implementation shape

### Frontend additions

Add a wizard component that can be opened from:

- onboarding local AI section
- AI settings
- Wealth Coach privacy gate

Suggested structure:

- `openLocalAiWizard(origin)`
- `closeLocalAiWizard()`
- `renderLocalAiWizard()`
- `refreshLocalAiWizardState()`
- `startLocalAiModelPull(modelName)`
- `cancelLocalAiModelPull()` if cleanly supported
- `applyLocalAiWizardSelection(modelName)`

Suggested runtime state:

```js
let localAiWizard = {
  open: false,
  origin: "settings", // onboarding | settings | wealth_coach | other
  status: "idle",     // idle | detecting | missing | installed_not_running | running_no_models | pulling_model | ready | error
  error: "",
  installedModels: [],
  selectedModel: "",
  recommendedModels: [
    { name: "llama4-scout", label: "Best quality", minRamGb: 32 },
    { name: "qwen3:8b", label: "Lighter general model", minRamGb: 16 },
    { name: "deepseek-r1:8b", label: "Local reasoning model", minRamGb: 16 }
  ],
  pull: {
    active: false,
    model: "",
    statusText: "",
    completed: 0,
    total: 0
  }
};
```

### Tauri backend additions

Add Rust-side commands because browser-mode fetch to localhost is less reliable and we want a unified path for desktop builds.

Suggested commands:

```rust
#[tauri::command]
async fn ollama_list_models() -> Result<Vec<OllamaModelSummary>, String>

#[tauri::command]
async fn ollama_pull_model(app: AppHandle, model: String) -> Result<(), String>

#[tauri::command]
async fn ollama_open_download_page() -> Result<(), String>
```

And one event channel for progress:

- `ollama://pull-progress`

Event payload example:

```json
{
  "model": "qwen3:8b",
  "status": "pulling manifest",
  "completed": 104857600,
  "total": 2147483648,
  "done": false
}
```

If streaming the raw pull progress through Tauri is too awkward in the first pass, a fallback implementation can:

- start the pull
- poll `GET /api/tags`
- show indeterminate progress plus status text

But the preferred path is true progress events.

## 8. Current app migration path

Current app behavior:

- onboarding shows manual install + copy/paste command
- `Test Ollama Connection` hits `http://localhost:11434/v1/models`
- on success it auto-configures provider + model

v1 wizard should replace or wrap this with:

1. detect via `ollama_list_models`
2. if unavailable, offer install link
3. if no models, offer in-app pull
4. if models exist, let user choose and apply

This is an upgrade path, not a rewrite of the AI system.

## 9. Error handling

The wizard should distinguish:

- `Ollama not installed or not reachable`
- `Ollama reachable, no models installed`
- `Pull failed`
- `Pull canceled`
- `Model downloaded but selection not applied`

Error copy should stay practical:

- `Ollama isn’t responding on this machine yet. Open the Ollama app and try again.`
- `No local models found yet. Download one to continue.`
- `Model download failed. You can retry here or run the pull command in Terminal.`

Do not bury these in tiny status text.

## 10. Privacy language

The wizard should say only what the product can actually stand behind.

Good:

- `When Ollama is active, Arca sends requests to a local server on this machine.`
- `No cloud provider is used while Ollama is the active provider.`

Avoid:

- hardcoded claims about every possible local configuration
- vague “100% safe” language

## 11. Recommended UI copy

### Entry point

`Set up Local AI`

### Missing state

`Run AI privately on this Mac. Install Ollama, then come back here and choose a model.`

### Running, no models

`Ollama is ready, but no local models are installed yet. Download one to continue.`

### Pulling

`Downloading qwen3:8b...`

### Ready

`Local AI is ready. Arca will use Ollama on this machine.`

## 12. Acceptance criteria

The feature is done when:

1. A user can open the wizard from onboarding or settings.
2. If Ollama is missing, the app opens the official download page.
3. If Ollama is running but empty, the app can pull a recommended model in-app.
4. Pull progress is visible.
5. When the model is ready, Arca auto-configures Ollama as the active provider.
6. The user can send a successful test request without manually editing base URL or model.
7. The flow works without needing Terminal for the common path.

## 13. Implementation phases

### Phase A

- add wizard UI
- add install-link state
- add local detection
- add model-list state

### Phase B

- add in-app pull via Ollama HTTP API
- add progress events or polling
- add success auto-configuration

### Phase C

- integrate wizard entry points across onboarding, settings, and wealth privacy gates
- add better model recommendations / lighter-vs-heavier guidance

## 14. Open questions

1. Should the default recommendation be `llama4-scout` or a lighter model like `qwen3:8b`?
2. Should the wizard remember the last successfully used local model separately from the provider config?
3. Do we want to support custom Ollama hosts later, or keep v1 limited to localhost?
4. Should `Wealth Coach` require Ollama for first use, or continue to allow cloud with explicit consent?

## 15. External references

- Ollama API overview: [https://docs.ollama.com/api](https://docs.ollama.com/api)
- Ollama list installed models (`/api/tags`): [https://docs.ollama.com/api/tags](https://docs.ollama.com/api/tags)
- Ollama pull model (`/api/pull`): [https://docs.ollama.com/api/pull](https://docs.ollama.com/api/pull)
- Tauri opener plugin: [https://v2.tauri.app/plugin/opener/](https://v2.tauri.app/plugin/opener/)
- Tauri shell plugin: [https://v2.tauri.app/plugin/shell/](https://v2.tauri.app/plugin/shell/)

