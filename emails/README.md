# Newsletter email kit

Each edition is one Markdown file in `app/content/newsletter/`. The build turns
it into an email using one of the layouts in `emails/layouts/`.

```bash
npm run newsletter:build -- --list          # the layouts and when to use each
npm run newsletter:build -- dear-specioza   # build one edition
```

A build writes:

- `public/newsletter/<slug>/`: the edition's images. Commit and deploy these before sending, because the email loads them from the live site.
- `.newsletter/<slug>/preview.html`: a self-contained copy to open and check.
- `.newsletter/<slug>/email.html` and `email.txt`: what gets sent.

The build refuses to finish if the copy breaks house rules (dashes, banned
phrases, "bestie" outside a playful edition, sensitive content without the
solemn register) and warns when the story is too short or too long.

## Layouts

| Layout | Feels like | Registers |
|---|---|---|
| `love-letter` | Parchment, cursive and a wax seal. Written to the woman herself. | warm, solemn |
| `letter` | Writing paper, italics and a taped snapshot. A friend writing to the reader. | playful, warm |
| `bulletin` | An old newspaper front page with a gossip column. | playful, warm |

`docs/newsletter/voice-guide.md` explains how to choose between them.

## Writing an edition

Copy `_sample-letter.md` or `_sample-bulletin.md` (files starting with `_` are
samples and never ship), or `dear-specioza.md` for a love letter. Set `woman:`
to a profile slug and the photo, credit and link come from her profile.

Body copy is plain paragraphs. Inline: `**bold**`, `*italic*`, `__underline__`,
`[link](url)`. Directives go on their own line:

| Directive | Does |
|---|---|
| `:::photo` | Places the portrait |
| `:::highlight Text` | The line the edition turns on |
| `:::fold` | A pause (a paper crease) |
| `:::column` | Starts the second column (bulletin) |
| `## Text` | A small subhead (bulletin) |

A layout ignores directives it has no use for, and the build says so.

## Adding a layout

1. Create `emails/layouts/<id>.mjs` exporting:
   - `meta`: id, name, vibe, `useWhen`, `avoidWhen`, `registers`, required `fields`, supported `blocks`.
   - `assets(edition, tools)`: returns the images this edition needs (photo treatment, cursive lines).
   - `render(edition, assets)`: returns the email HTML.
2. Add it to the list in `emails/layouts/index.mjs`.
3. Add a `_sample-<id>.md` edition so there is something to copy.
4. Put any fixed artwork (paper, stamps, nameplates) in `public/newsletter/kit/`.

Nothing in the build script changes. `--list` picks the new layout up from its `meta`.

## Email rules every layout follows

- 600px wide, table layout, inline styles, one media query for phones.
- Text stays live. Only short cursive lines, nameplates and signatures are images, and every image has alt text.
- Web fonts are a bonus (Apple Mail). Each layout must still look right in its fallback (Times or Georgia), because Gmail ignores web fonts.
- Light only: these are paper, so they keep their colours in dark mode.
- Under 102 KB of HTML, or Gmail clips it.
- The unsubscribe link is `{{{RESEND_UNSUBSCRIBE_URL}}}`; Resend fills it in per reader.
