# Resend spike: findings (15 Nov 2026)

Checked against Resend's docs and pricing page. Items marked "test" still need
one test broadcast on the real account.

## Confirmed

- Free marketing plan: 1,000 contacts, unlimited broadcasts, 3 segments.
- Free transactional plan: 3,000 emails a month, 100 a day. The welcome email
  counts here.
- The Broadcast API accepts our own HTML. `send: false` creates a draft that
  can be sent or scheduled later by ID.
- Test sends, scheduling, open and click tracking are available.
- CSV import and a Contacts Import API exist, with custom contact properties.
- `{{{RESEND_UNSUBSCRIBE_URL}}}` gives each recipient a working unsubscribe
  link, and Resend updates the contact's status.
- Resend's hosted unsubscribe page can carry our logo, colours, title and
  description. Its "Powered by Resend" footer can only be removed on Pro.
- Nothing in the docs or pricing says Resend adds its branding to the email
  itself.
- Unsubscribed contacts stay in the account until deleted.

## Still to test on the account

1. No Resend branding appears in a delivered broadcast on the free plan.
2. A custom contact property (an unsubscribe token) can be merged into a link
   in broadcast HTML. This decides whether the unsubscribe link can go to our
   own page.
3. Whether unsubscribed contacts count toward the 1,000.
4. Whether the API accepts a plain-text part and preview text.

## Unsubscribe decision

- Option A, our own page: the email links to `/newsletter/unsubscribe` with a
  signed token, and the site tells Resend to unsubscribe the contact. Fully
  branded. Depends on test 2.
- Option B, Resend's page: styled with our logo and colours, with a small
  "Powered by Resend" line on that page only. Works today, no code.

Plan: build A if test 2 passes, keep B as the fallback.
