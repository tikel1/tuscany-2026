# Quiz SFX

The per-day kid quiz (Quizzo) plays three short non-voice sounds:

- **correct** — when the kid picks the right answer
- **wrong** — when the kid picks a wrong answer
- **whoosh** — score-reveal transition

By default these are **synthesized at runtime** via the Web Audio API
inside `src/lib/quiz/quizSfx.ts` (see `synthCorrect`, `synthWrong`,
`synthWhoosh`). Synthesizing keeps the bundle byte-free, sounds clean
on every device, and is destination-agnostic so the same code drops
into any trip.

If you'd rather ship **custom MP3s**, drop them into this folder with
exactly these filenames:

```
public/audio/quiz/correct.mp3
public/audio/quiz/wrong.mp3
public/audio/quiz/whoosh.mp3
```

The loader prefers an MP3 when it exists (HEAD request at first use)
and falls back to the Web Audio synth otherwise — no code change
needed. Keep each file under ~15 KB so the SPA stays tiny.
