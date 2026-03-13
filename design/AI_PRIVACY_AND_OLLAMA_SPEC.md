# AI Privacy Tiers & Local LLM (Ollama) Integration

> **Status:** Implemented
> **Files changed:** `src/index.html`

---

## What Changed

### 1. Ollama as First-Class Provider

Ollama is now a dedicated provider option (not hidden behind "OpenAI-compatible"):

- Added to `AI_ALLOWED_PROVIDERS` array
- Default baseUrl: `http://localhost:11434/v1`
- Default model: `llama4-scout`
- No API key required (detected and hidden automatically)
- Uses OpenAI-compatible chat completions format (same code path)
- Auto-detection: when Ollama is selected in settings, probes `localhost:11434` and shows connection status

### 2. Privacy Info Badge (Settings Panel)

Below the provider dropdown, a privacy badge dynamically shows:

- **Ollama:** "All data stays on your machine. Nothing is sent externally."
- **DeepSeek:** Warning about data flowing to China servers with recommendation to use Ollama
- **All other cloud providers:** "Data is sent to [provider] servers. Not used for model training via API."

### 3. Session-Only API Key

Checkbox in settings: "Don't save my API key (enter each session)"

When checked:
- Key is stored in JS runtime variable (`aiSessionOnlyKey`), not localStorage
- On app reload, key field is empty
- `aiResolveConfig()` checks runtime key first, falls back to stored key
- `aiPrefs.sessionOnlyKey` flag persists (so checkbox state is remembered)

### 4. Redesigned Onboarding Step 2

Two-stage flow replacing the old jump-straight-to-provider approach:

**Stage A: AI opt-in/out**
- Explains what data AI sees (goals, tasks, practices, commitments)
- Explains what it doesn't see (passwords, financial account numbers)
- Two buttons: "Enable AI coaching (recommended)" / "Skip AI"
- Skip immediately advances to Step 3

**Stage B: Provider tier selection** (shown after "Enable")
- **Cloud AI card:** Provider dropdown, API key, Connect button
  - DeepSeek warning shown conditionally when DeepSeek selected
- **Local AI card:** Ollama guided setup
  - Step 1: Install instructions (ollama.com link + brew command)
  - Step 2: Pull command with copy button (`ollama pull llama4-scout`)
  - Step 3: Test connection button that probes localhost:11434
  - Auto-populates model dropdown on successful connection
  - Recommended models: llama4-scout, qwen3:8b, deepseek-r1:8b
- **Brain dump textarea** (shared by both tiers, below the cards)

---

## Data Privacy Summary for Users

| Provider | Data destination | Training? | Retention | Risk |
|----------|-----------------|-----------|-----------|------|
| Ollama | Your machine only | No | None | None |
| OpenAI (API) | OpenAI servers | No | 30 days | Low |
| Anthropic (API) | Anthropic servers | No | 30 days | Low |
| Google Gemini (API) | Google servers | No | Varies | Low |
| Grok (API) | xAI servers | No | Varies | Low |
| DeepSeek (API) | China servers | Unknown | Unknown | High |

---

## Technical Notes

- Ollama uses the same `runOpenAiCompatibleChat()` code path as OpenAI/Grok/DeepSeek
- `aiProviderNeedsKey("ollama")` returns `false` — key input is hidden
- Ollama model list fetched from `GET http://localhost:11434/v1/models` (OpenAI format)
- `AbortSignal.timeout(5000)` used for Ollama probes to avoid blocking UI
- The `aiSessionOnlyKey` variable is intentionally not exported or synced anywhere

---

*Spec created 12 March 2026.*
