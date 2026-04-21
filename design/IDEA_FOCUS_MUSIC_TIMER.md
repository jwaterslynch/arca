# Idea: Focus Music in the Timer

**Status:** Roadmap idea. Not in current scope. No driver assigned.
**Date filed:** 2026-04-20

## The idea

Integrate focus music into the Arca focus timer. When a user starts a session, optionally play music that's designed to support deep work — no lyrics, long-form, low-attention-pull.

Reference sources that prompted the idea:
- 3-hour focus music video: https://youtu.be/74cOUSKXMz0
- [brain.fm](https://www.brain.fm/) — peer-reviewed music service specifically designed for focus

## Why this might matter

- The timer is the most frequently-used surface in Arca. Anything that improves the *experience* of starting a session lowers friction.
- Audio is a well-documented focus aid for a subset of users (not all — some people need silence).
- If the music is good enough, it becomes a reason to reach for Arca's timer instead of a browser or another app.

## The two paths the user raised

### Path A: Use existing free / royalty-free music

**Plausible sources to evaluate:**
- **YouTube Audio Library** (royalty-free; embeddable only via YouTube player)
- **Musopen** (public-domain classical; downloadable)
- **Pixabay Music** (royalty-free, no attribution required)
- **Incompetech** (Kevin MacLeod, CC-BY; attribution required)
- **Free Music Archive** (mixed licensing; per-track check)
- **Mubert** (AI-generated, has an API with a free tier for apps)
- **Spotify / Apple Music deep links** — we don't license audio; we open the user's own subscription to a specific playlist

**Rough evaluation:**
- Easiest MVP: embed a YouTube player pinned to a curated video, or a Spotify deep link to a focus playlist. Zero licensing burden for us.
- Nicer MVP: bundle 2-3 tracks from Pixabay/Musopen into the app. No network needed, works offline.
- Richer: integrate Mubert's API for generative focus audio (costs small ongoing fees).

**brain.fm specifically:** has an API but it's a paid partnership tier, not free. Unless we strike a deal, skip.

### Path B: Create our own

**If the user produces the music themselves:**

*Spec for focus-supportive audio (based on the relevant research):*
- **Instrumental.** No lyrics — lyrics compete with language processing.
- **Tempo:** 60–80 BPM, or non-rhythmic ambient.
- **Dynamic range:** low. No sudden volume changes or dramatic drops.
- **Melodic hooks:** avoid memorable melodies. They pull attention.
- **Length:** 25+ minutes per track (matches pomodoro session), or seamlessly loopable.
- **Frequency character:** midrange-dominant works well. Some evidence that a pink-noise or brown-noise layer underneath masks environmental sound effectively.
- **Avoid:** binaural beats / isochronic tones unless you want to lean into a specific wellness positioning — the peer-reviewed evidence for their effectiveness is weak and contested.

**Production approach:**
- DAW: Logic Pro / Ableton / Reaper
- Style: ambient electronic, lo-fi, classical piano + strings, or generative (e.g. via a Eurorack or AI tools like Suno/Udio with careful prompting)
- Deliverable: stereo WAV or high-quality AAC, normalized to −16 LUFS for streaming compatibility
- Target: 3-5 tracks initially, each 25+ min

## What peer-reviewed evidence actually supports

Brief summary — useful for any future "why this works" marketing:

- **Ambient / instrumental music without lyrics** — consistently outperforms music with lyrics for language-heavy tasks. Broadly accepted.
- **Baroque music / "Mozart effect"** — largely debunked as a cognitive enhancer; the original effect was small, transient, and task-specific.
- **Binaural beats** — weak evidence in meta-analyses. Some users report benefit, likely placebo + attention anchoring.
- **Noise masking** (pink, brown, white) — moderate evidence for improving focus in noisy environments, particularly for ADHD.
- **Personal preference** — meta-analyses show familiar/enjoyed music helps most users more than any "optimized" composition. Caveat: not for tasks requiring reading comprehension, where silence usually wins.

brain.fm's specific claims rest on proprietary internal studies and a handful of small external ones. Legitimate company, but their "peer-reviewed" language is less rigorous than it sounds.

## Integration options (ranked by complexity)

| Option | Effort | UX | Licensing burden |
|---|---|---|---|
| Embed a YouTube player in the timer modal | XS | OK (needs network, no offline) | None (user watches YouTube) |
| Spotify/Apple Music deep link | XS | Opens external app | None |
| Bundled royalty-free tracks in the app | S | Offline, feels native | Per-track license check |
| User's own bundled tracks + built-in player | M | Best UX | None (user owns) |
| Mubert API for generative audio | M | Good, always fresh | Small ongoing cost |
| Brain.fm partnership | L | Best evidence-based | Paid partnership required |

## What to decide before building

1. **Is music an Arca feature or a separate product?** If it's a feature, keep it simple (deep link or bundled tracks). If it's a differentiator worth positioning around ("Arca focus sessions include scientifically-designed audio"), invest more.
2. **Does the user want to produce the music themselves?** If yes, this becomes a content project with a different cadence than typical product work.
3. **Offline or online?** Bundled tracks work in airplane mode; streaming embeds don't.
4. **Which user actually wants this?** Validate with the current user (you) — do you actually listen to music while working? What are you reaching for now? That's the answer to what to build.

## Recommended next step when this gets picked up

- **Cheapest possible test:** add a toggle to the timer modal that, when on, pops open a pinned YouTube tab or Spotify playlist. See if you actually use it over a week.
- If yes and it's sticky → bundle 2-3 royalty-free tracks as built-in audio.
- If you start producing your own music → replace the bundled tracks with your own, which becomes a brand asset.

## Not to do now

This is explicitly **not** current scope. Current scope is Track B (iOS health capture, Phase A). Filing this so it isn't lost. Revisit after Track B proves or fails.
