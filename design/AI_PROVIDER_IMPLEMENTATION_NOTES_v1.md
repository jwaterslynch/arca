# AI Provider Implementation Notes v1

Date: 2026-03-02  
Product: Arca  
Purpose: Operational notes for engineers/AI agents implementing and debugging provider integrations.

## Scope

These notes document behavior implemented in `src/index.html` for:
- provider defaults
- connection tests
- provider endpoint differences
- fallback behavior on model/policy errors

Primary functions to inspect:
- `aiDefaultBaseUrl(provider)`
- `aiDefaultModel(provider)`
- `aiPreferredModelHints(provider)`
- `aiFetchAvailableModels(cfgLike)`
- `aiCallProvider(systemPrompt, userPrompt, prefsOverride)`
- `testAiConnection()`

## Critical implementation decisions

## 1) Grok uses `/responses`, not `/chat/completions`

Reason:
- User validated key/model via terminal using xAI `POST /v1/responses`.
- In-app failures persisted when Grok used OpenAI-style `chat/completions`.

Current behavior:
- `cfg.provider === "grok"` path in `aiCallProvider` sends:
  - `POST {baseUrl}/responses`
  - body: `{ model, temperature, input: [{role:"system"...},{role:"user"...}] }`
- Response parser reads:
  - `output[].content[].text`
  - fallback `output_text`

## 2) Grok connection test is prompt-safe

Reason:
- Strict JSON probe prompts triggered policy checks in some Grok runs.
- A simple "ping/ok" prompt was proven to succeed.

Current behavior:
- `testAiConnection()` uses a benign probe:
  - system: `"You are a concise assistant."`
  - user: `"Reply with exactly: ok"`
- Success criteria:
  - valid `{ok:true}` JSON OR any non-empty text response.

## 3) Model IDs are unstable; fallback is required

Reason:
- Provider model aliases and availability changed, causing "model not found" failures.
- Some teams/keys have model-specific policy/ACL restrictions.

Current behavior:
- Model normalization (`aiNormalizeModelId`) and preferred hints per provider.
- On model errors or Grok policy-style blocks, app retries with alternative models.
- On success, chosen model is written back to active provider config.

## 4) Grok model-list endpoint is treated cautiously

Reason:
- In observed failures, key worked for `responses` but `/models` calls were noisy or misleading.

Current behavior:
- For Grok, `aiFetchAvailableModels` returns preferred hint list directly.
- For other providers, `aiFetchAvailableModels` queries provider model list endpoints.

## 5) Unsaved key UX in settings

Reason:
- Users saw `Enabled (missing key)` while typing key before save.

Current behavior:
- While settings panel is open, typed key input is considered for badge state.

## Provider defaults (as implemented)

- OpenAI: base `https://api.openai.com/v1`, default `gpt-4.1-mini`
- Anthropic: base `https://api.anthropic.com/v1`, default `claude-sonnet-4-5`
- Gemini: base `https://generativelanguage.googleapis.com/v1beta`, default `gemini-2.5-flash`
- Grok: base `https://api.x.ai/v1`, default `grok-4-1-fast-non-reasoning`
- DeepSeek: base `https://api.deepseek.com/v1`, default `deepseek-chat`

Note:
- Defaults are only starting points. Do not assume they are always valid in future.
- Always keep fallback logic active.

## Known failure modes and interpretation

### A) `Incorrect API key provided: ...`
Meaning:
- Key string is wrong/corrupted (often placeholder text or accidental pasted characters).

Action:
- Re-enter key using hidden terminal read (no clipboard pollution), trim whitespace, retry.

### B) `Model not found` / `not supported`
Meaning:
- Stale or unavailable model ID.

Action:
- Let fallback pick another model.
- Save settings after successful test so the chosen model persists.

### C) Grok `403 ... Content violates usage guidelines ... SAFETY_CHECK_TYPE_BIO`
Meaning:
- Request was blocked by policy checks for that model/request shape/team context.

Action:
- Retry on alternative Grok models.
- Use benign test prompt.
- Prefer `responses` endpoint for Grok.

## Repro/verification commands (manual)

## Verify Grok key and endpoint outside app

```bash
read -s "?Paste xAI API key (hidden): " XAI_API_KEY; echo
XAI_API_KEY="$(printf %s "$XAI_API_KEY" | tr -d '\r\n[:space:]')"
curl https://api.x.ai/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -d '{"input":[{"role":"user","content":"ping"}],"model":"grok-4-1-fast-reasoning"}'
unset XAI_API_KEY
```

Expected:
- 200 response with output text.

## Build and reinstall app for local testing

```bash
cd '/Users/julianwaterslynch/Workspace/Products/Arca/arca'
npm run build
```

Then replace app bundle in `~/Applications` with latest built `.app`.

## Maintenance rules for future AI agents

1. Keep provider-specific paths explicit; do not force all providers through OpenAI-compatible chat completions.
2. Keep connection tests benign and provider-safe.
3. Treat provider model lists as dynamic, not static truth.
4. Preserve fallback-on-failure behavior.
5. When changing defaults, do not remove retry logic.
6. If user reports "works in curl, fails in app", first compare endpoint shape and prompt shape.
