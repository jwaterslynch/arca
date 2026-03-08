# Roadmap: Streams Architecture & Progress Photos

> Status: **Design spec — not yet building**
> Target: Mobile companion + Supabase sync phase

---

## 1. Streams Architecture (Long-term target)

The current practice model (`life_practices.practices` + `daily_log`) is a transitional bridge.
The target architecture is a normalized "streams" schema.

### Collections

```
state.streams              — stream definitions
state.stream_events        — activity log entries
state.stream_targets       — goals/targets per stream
state.stream_milestones    — key milestones
state.stream_notes         — reflections, insights, blockers
state.stream_ai_threads    — coaching conversation history
state.stream_ai_proposals  — AI-proposed actions
state.stream_links         — connections to tasks/commitments
```

### Stream shape

```js
stream = {
  id,
  type,             // life_practice | work_domain
  slug,
  title,
  status,           // active | paused | archived
  category,
  description,
  coach_mode,       // coach | tracker | off
  color,
  icon,
  created_at,
  updated_at
}
```

### Stream event shape

```js
stream_event = {
  id,
  stream_id,
  event_type,
  occurred_at,
  source,           // mobile | desktop | ai
  note,
  metrics,          // object (e.g. { bodyweight_kg, session_type, energy })
  tags,             // string[]
  attachments,      // object[] (see progress photos below)
  linked_task_id,
  linked_commitment_id
}
```

### Migration rules

- Each existing life practice becomes a `stream`
- Each primary work domain becomes a `stream`
- Existing tasks keep working as-is
- `stream_links` connect streams to tasks/commitments
- No destructive migration of current data

### When to migrate

Trigger: when mobile sync / Supabase backend demands proper normalized tables.
Not before.

---

## 2. Current Bridge Model (Shipping now)

The practice model has been extended with transitional fields:

```js
practice = {
  id, title,
  kind,             // "life_practice" | "work_domain"
  minimum_minutes, default_minutes, note,
  coach_enabled,    // boolean
  target_value,     // e.g. 3
  target_unit,      // e.g. "sessions/week"
  domain_key,       // optional work domain identifier
  color, icon
}
```

Daily log entries support structured sub-entries:

```js
daily_log[dateKey][practiceId] = {
  done: true,
  minutes: 55,
  notes: "Leg day",
  entries: [
    {
      id,
      at,
      text: "Back squat 3x5 @ 70kg, RDL 3x8",
      minutes: 55,
      metrics: {
        bodyweight_kg: 81.2,
        session_type: "lower",
        energy: 7
      },
      attachments: [
        {
          id,
          type: "progress_photo",
          storage_key,
          thumb_key,
          captured_at,
          pose,        // front | side | back
          mode,        // relaxed | flexed
          mime_type,
          width,
          height
        }
      ]
    }
  ]
}
```

This maps cleanly to `stream_event` when the full migration happens.

---

## 3. Progress Photos (Mobile Companion Feature)

### Capture flow

- `Gym` stream gets a "Log workout" flow with "Add progress photo"
- Opens in-app camera (not photo library)
- Quick review: Retake / Use photo + optional tags (front, side, back, flexed, relaxed)
- Photo stored in app's private sandbox, NOT system Photos app
- Background upload after workout save; delete local temp after confirmed upload
- Offline: private upload queue, sync later

### Storage

- File in private object storage (Supabase bucket: `progress-media`)
- Only metadata in database / synced app state
- Private buckets + signed URLs for desktop viewing
- Strip EXIF/location metadata on upload
- Generate thumbnail for review screens

### Supabase metadata table

```sql
id
user_id
stream_id
event_id
attachment_type
storage_key
thumb_key
captured_at
pose
mode
mime_type
width
height
created_at
```

### Desktop review integration

- Gym stream panel shows recent workouts with thumbnails
- Click entry → full workout log with attached photos
- "Progress Photos" strip inside gym panel
- Simple compare mode: latest vs previous matching pose

### Privacy rules

- Photos never go to general camera roll unless user explicitly exports
- Temp files deleted after confirmed upload
- Access private to user
- Delete attachment if workout entry deleted
- No AI image analysis at MVP — photos as review context only

### MVP scope

- 1-3 photos per gym workout entry
- In-app camera capture
- Private upload
- Thumbnail in desktop gym review
- Full-size open on click
- Optional tags: front / side / back
- Optional workout note and metrics

---

## 4. Build Order

### Already shipped (current session)
1. ✅ Practice drawers with free-text logging (Execute sidebar)
2. ✅ Per-practice detail cards in Review (7-day strip, stats, entries)
3. ✅ Time-range selector (Week / Month / 6 Months)
4. ✅ Contribution calendars + sparklines
5. ✅ Per-practice AI coaching with stream-scoped prompts
6. ✅ Bridge model fields (kind, target, coach_enabled)
7. ✅ Schema support for entries[] + attachments[]

### Next (desktop, no mobile dependency)
8. Work domain streams (use existing practices with kind: "work_domain")
9. Stream panel / deep-dive drawer (click streak row → opens panel)
10. Richer metrics capture in log entries
11. AI coaching prompt tuning based on real usage

### Later (requires mobile companion + Supabase)
12. Full streams schema migration
13. Mobile workout logging with metrics
14. Progress photo capture + upload
15. Desktop photo review + compare mode
16. Cross-device sync via Supabase

### Explicitly deferred
- Attachments/photos (until mobile ships)
- Voice transcription
- Cross-stream AI reasoning
- Adaptive targets
- Complex custom chart builder
- Multiple coach personas per stream
- AI image analysis of progress photos
