# Newsletter rebuild: plan and handoff

Read this with `docs/newsletter/voice-guide.md`, `docs/newsletter/resend-spike.md`
and `emails/README.md`. Follow `CLAUDE.md` and the `nuxt-conventions` used in
this repo.

## Decisions already made

- Move from Buttondown to Resend Broadcasts. Free tier: 1,000 contacts.
- Single opt-in. Half of past signups never confirmed, so no confirmation step.
  Safeguards instead: honeypot field, rate limit, immediate welcome email,
  remove contacts that bounce.
- From `HerStory Africa <letters@herstoryafrica.com.ng>`, reply-to
  `dee@herstoryafrica.com.ng`. Signed "Deevyn".
- Import all 24 Buttondown signups, including unconfirmed ones. The export CSV
  is kept by Deevyn outside the repo. Never commit subscriber data.
- Past Buttondown editions are not carried into the new archive.
- Three layouts: `love-letter`, `letter`, `bulletin`. More will be added.
- First edition: `dear-specioza` (love letter), sending 1 December 2026.
- Twice a month, 1st and 15th. Drafted by Claude in a session three days
  before, never auto-sent.
- Approval happens in `/admin`. The same draft must also be visible in Resend.
- No database. Use signed tokens where state is needed.

## Resend account (checked 15 Nov 2026)

- Domain `herstoryafrica.com.ng` verified, sending enabled, region eu-west-1.
- One segment, "General". No contacts, topics, templates or broadcasts yet.
- Open and click tracking are off on the domain.
- Key is `NUXT_RESEND_API_KEY` in `.env` (`runtimeConfig.resendApiKey`).
- The old suggestion-email templates (`suggestion-accepted`,
  `suggestion-already-exists` in `server/utils/resend.ts`) do not exist on this
  account. Recreate them after the newsletter work.

## Done

- Email kit: `emails/layouts/` (registry in `index.mjs`), fixed artwork in
  `public/newsletter/kit/`, cursive font in `emails/fonts/`.
- `npm run newsletter:build -- <slug>` builds an edition from
  `app/content/newsletter/<slug>.md` into `.newsletter/<slug>/` and writes its
  images to `public/newsletter/<slug>/`. It enforces the house rules.
- `npm run newsletter:test -- <slug> <address>` sends one built edition to one
  address. Written but not yet proven against Resend.
- Voice guide, including how to choose a layout and the tea/lesson/pull rule.
- Edition `dear-specioza` and two samples (`_sample-*`, never shipped).

## Progress (15 Nov 2026)

Items 2 to 10 are built and not yet committed. Item 7 (import) was done by
Deevyn in the Resend dashboard: 24 contacts in General. Item 1 continues from
real inbox screenshots. Waiting on a decision: one test broadcast to a
one-person segment, to settle the unverified items below and decide whether
the footer moves to our own unsubscribe page (`OWN_UNSUBSCRIBE_PAGE` in
`emails/layouts/shared.mjs`).

## Still to build, in this order

1. **Fix whatever the inbox tests show** in the three layouts (Gmail app,
   Gmail web, Outlook, Apple Mail). Known risks: parchment background image in
   Outlook, web fonts falling back to Times and Georgia.
2. **Send step.** The build should also emit each edition's `email.html`,
   `email.txt` and metadata somewhere the deployed server can read (for example
   Nitro server assets), because `.newsletter/` is gitignored.
3. **`/admin/newsletter`.** Replace the Buttondown version. List editions with
   status (draft, scheduled, sent), preview the email, "Send test to me",
   "Approve and schedule" (creates the Resend broadcast for the General
   segment and schedules it). Nothing sends without that click. Show
   subscriber counts from Resend. Protect every route with `requireAdmin`.
4. **Subscribe.** `server/api/subscribe.post.ts` creates the Resend contact in
   the General segment and sends the welcome email. Keep the response shape
   `NewsletterForm.vue` expects. Keep `NewsletterModal.vue`.
5. **Unsubscribe page** at `/newsletter/unsubscribe`, on brand. Preferred: a
   signed token per contact merged into the email link, with the page calling
   Resend to unsubscribe. Fallback: Resend's hosted page, customised.
6. **Archive.** Add a `newsletter` collection in `content.config.ts`
   (exclude files starting with `_`, hide editions dated in the future), pages
   `/newsletter/archive` and `/newsletter/[slug]`, sitemap and prerender
   entries. `/newsletter/confirmed` becomes a welcome page or is removed.
7. **Import** the 24 contacts into Resend from the CSV Deevyn provides.
8. **Retire Buttondown:** `scripts/draft-newsletter.mjs`,
   `server/utils/buttondown.ts`, the `newsletter:draft` script, the env keys,
   and turn `.github/workflows/newsletter.yml` into a reminder only.
9. **Recreate the suggestion-email templates** on the new Resend account.
10. Update `CLAUDE.md`, `README.md` and `.env.example`.

## Still unverified (from the spike)

- Whether a custom contact property can be merged into a link in broadcast
  HTML (decides item 5).
- Whether unsubscribed contacts count toward the 1,000.
- ~~Whether the Broadcast API takes a plain-text part and preview text.~~
  Yes (15 Nov 2026): a draft created with `text` and `preview_text` read
  back with both stored, and the HTML stored unchanged. The admin sends
  `text` but not `preview_text`, because every layout already has its own
  padded preheader.
- That no Resend branding appears in a delivered broadcast on the free plan.

Check each against Resend's current docs or a real call. Do not assume.

## Rules

- Never send to subscribers, schedule a broadcast, or import contacts without
  Deevyn's explicit go-ahead in that session.
- Test sends go only to an address Deevyn gives.
- Never commit `.env`, subscriber exports or anything under `.newsletter/`.
- Run `npm run lint` and `npm run typecheck` before calling anything done.
- Content copy follows the house style: no dashes, no AI tell-tale phrasing.
