# AI Assistant Contract v1

Date: 2026-03-01  
Product: PPP Flow Desktop  
Status: Approved MVP contract

## 1) Product decisions (locked)

1. AI Assistant is optional and OFF by default.
2. If AI is disabled and no API key is set, AI UI is hidden from main views.
3. Interaction flow is always: chat -> proposal -> review -> apply.
4. No direct model writes to board state.
5. v1 undo policy: only immediate undo of last AI apply batch; disable that undo once user makes a manual edit.

## 2) User flow

1. User opens AI Assistant and chats freely.
2. Model returns `summary`, `actions[]`, `assumptions[]`, `questions[]`.
3. App validates actions against schema and board rules.
4. App shows Proposed Changes panel with per-action toggles.
5. User clicks Apply.
6. App applies selected valid actions as one batch.
7. App records batch log and offers immediate undo.

## 3) Context injection contract

Send compact board context on every model call:

1. `focus`: primary goal, secondary goal, lead/input notes, weekly notes.
2. `tasks_open`: each task with `id,title,category,importance,urgency,depth,goal,stage`.
3. `life_practices`: each with `id,title,minimum_minutes,note,done_today,minutes_today`.
4. `weekly_commitments`: each with `id,title,goal,linked_task_id,is_done`.
5. `limits`: `today_limit=5`, `next_up_soft_limit=10`.
6. `clock`: local date/time and timezone.

Target payload size: 2-5KB JSON for normal boards.

## 4) Provider abstraction

```ts
type ProviderId = "openai" | "anthropic" | "openai_compatible";

type ProviderConfig = {
  provider: ProviderId;
  apiKey: string;
  model: string;
  baseUrl?: string; // required for openai_compatible
  temperature?: number; // default 0.2
};

type HealthCheck = {
  ok: boolean;
  provider: ProviderId;
  model?: string;
  latencyMs?: number;
  error?: string;
};

type SuggestRequest = {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  context: BoardContext;
};

type SuggestResponse = {
  summary: string;
  actions: AIAction[];
  assumptions: string[];
  questions: string[];
};

interface AIProvider {
  testConnection(config: ProviderConfig): Promise<HealthCheck>;
  suggestChanges(config: ProviderConfig, req: SuggestRequest): Promise<SuggestResponse>;
}
```

## 5) Action schema

```ts
type Stage = "backlog" | "next_up" | "today";
type Goal = "None" | "PG1" | "PG2";
type Importance = "High" | "Low";
type Urgency = "High" | "Low";
type Depth = "Deep" | "Shallow";
type Category =
  | "Strategic"
  | "Maintenance"
  | "Body/Mind"
  | "Travel/Admin"
  | "Revenue/Venture";

type AIAction =
  | {
      type: "task.create";
      client_ref: string;
      task: {
        title: string;
        category: Category;
        importance: Importance;
        urgency: Urgency;
        depth: Depth;
        goal: Goal;
      };
      place: { stage: Stage; before_task_id?: string };
    }
  | {
      type: "task.update";
      task_id: string;
      patch: {
        title?: string;
        category?: Category;
        importance?: Importance;
        urgency?: Urgency;
        depth?: Depth;
        goal?: Goal;
      };
    }
  | {
      type: "task.move";
      task_id: string;
      to_stage: Stage;
      before_task_id?: string;
    }
  | {
      type: "task.complete";
      task_id: string;
      completed: boolean;
    }
  | {
      type: "life_practice.create";
      client_ref: string;
      practice: { title: string; minimum_minutes: number; note?: string };
    }
  | {
      type: "life_practice.update";
      practice_id: string;
      patch: { title?: string; minimum_minutes?: number; note?: string };
    }
  | {
      type: "commitment.create";
      client_ref: string;
      commitment: { title: string; goal: Goal; linked_task_id?: string; use_finish_track?: boolean };
    }
  | {
      type: "commitment.update";
      commitment_id: string;
      patch: { title?: string; goal?: Goal; linked_task_id?: string | null; is_done?: boolean };
    }
  | {
      type: "focus.update_primary_goal";
      title: string;
      deadline?: string; // YYYY-MM-DD
      measure?: string;
    };
```

## 6) Validation rules (before apply)

1. Reject unknown action `type`.
2. Reject unknown enum values.
3. Reject malformed IDs on update/move/complete.
4. Reject empty patches for update actions.
5. Enforce `today` cap at 5 open tasks.
6. Reject any action that tries to move directly to `done` stage.
7. Run dry-run execution for full selected batch before state mutation.
8. If any selected action fails dry-run, block apply and show error list.

## 7) Output contract for model

Required top-level JSON object:

```json
{
  "summary": "I will add 2 tasks, move 1 task to Today, and add 1 life practice.",
  "actions": [],
  "assumptions": [],
  "questions": []
}
```

Notes:

1. `summary` should be concise and user-facing.
2. `assumptions` must list inferred choices.
3. `questions` must contain unresolved ambiguities.
4. If no action is needed, return `actions: []` with explanation in `summary`.

## 8) Settings and feature gating

Settings fields:

1. `Enable AI Assistant` toggle.
2. `Provider` select: OpenAI, Anthropic, OpenAI-compatible.
3. `API Key` input (store in OS keychain only).
4. `Model` input/select.
5. `Base URL` input (only for OpenAI-compatible).
6. `Test connection` button.
7. `Hide AI UI when disabled` toggle (default ON).

Behavior:

1. AI panel hidden if disabled and hide toggle is ON.
2. No onboarding nags for API setup.
3. If enabled but not configured, show setup hint inside AI panel only.

## 9) Apply and undo model

1. Apply selected validated actions as one atomic batch.
2. Write batch log with:
   - timestamp
   - provider/model
   - prompt hash
   - actions applied
   - pre-state checksum
   - post-state checksum
3. Show `Undo AI batch` CTA immediately after apply.
4. Disable `Undo AI batch` after first manual edit.

## 10) Implementation order

1. Schema definitions + validator.
2. Dry-run executor + error reporting.
3. Proposal review UI with per-action toggles.
4. Provider layer (OpenAI, Anthropic, OpenAI-compatible).
5. Settings + keychain integration + feature gating.
6. Apply log + immediate undo.
7. Prompt tuning and quality pass.

## 11) Non-goals for v1

1. Autonomous background agent behavior.
2. Silent auto-apply.
3. Long-term autonomous memory beyond board state.
4. Multi-user collaboration semantics.

