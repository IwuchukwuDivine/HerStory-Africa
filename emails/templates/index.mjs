// The Resend-hosted templates, addressed by alias from the server:
//   newsletter-welcome         server/utils/subscribers.ts
//   suggestion-accepted        server/utils/resend.ts
//   suggestion-already-exists  server/utils/resend.ts
//
// Change the copy here, then run `npm run resend:setup` to push and publish.
// Copy follows the house style in CLAUDE.md: no dashes, no AI phrasing.

import { SITE, a, button, hand, letterButton, letterPage, line, p, page, row, signature, stress } from "./base.mjs";

const FROM = "HerStory Africa <letters@herstoryafrica.com.ng>";
const REPLY_TO = ["dee@herstoryafrica.com.ng"];

const transactionalFooter = `HerStory Africa · ${a(SITE, "herstoryafrica.com.ng")}. You are getting this because you sent us a suggestion.`;

export const templates = [
  {
    alias: "newsletter-welcome",
    name: "Newsletter welcome",
    from: FROM,
    reply_to: REPLY_TO,
    subject: "Welcome to the HerStory Africa newsletter",
    variables: [
      { key: "unsubscribe_url", type: "string", fallback_value: `${SITE}/newsletter` },
    ],
    html: letterPage({
      title: "Welcome to the HerStory Africa newsletter",
      preview: "I'm so glad you're here!",
      heroAlt: "An airmail envelope addressed by hand: To you, wherever you are reading this. The stamp carries the HerStory Africa mark and reads, the women history forgot, posted twice a month.",
      body: [
        row("Hey you! 🤎", { top: 26 }),
        row(
          [
            line("I'm so glad you're here!"),
            line(
              `You know how you come across a story and immediately think, ${stress("wait, how have I never heard about this woman before?")} ` +
                "That's pretty much how HerStory Africa started.",
            ),
            line(
              "There are so many incredible African women whose stories we barely hear about, and I wanted to create a space " +
                "where we could discover them, talk about them, and give them the attention they deserve.",
            ),
            line(
              "So, welcome to our little corner of the internet! Think of this as our inner circle, where I get to share the " +
                "stories, discoveries, and little bits of history I can't keep to myself.",
            ),
            line("And you don't have to wait for my next email. There's already plenty to explore.", { last: true }),
          ].join("\n"),
        ),
        row(letterButton(`${SITE}/newsletter/archive`, "Catch up on past letters"), { top: 20 }),
        row(
          line("Here's to the stories we'll uncover, the history we'll unravel, and the women we'll never forget. 🥂", { last: true }),
          { top: 20 },
        ),
        row("With love,", { top: 26 }),
        `    <tr><td class="pad" style="padding:0 56px 0 50px;">${hand()}</td></tr>`,
        row(
          line(
            "P.S. If this landed in Promotions, Updates, or even spam, could you drag it into your main inbox? That way my letters actually reach you.",
            { last: true, small: true },
          ),
          { top: 16 },
        ),
      ].join("\n"),
      footer: `You are getting this because you subscribed at ${a(SITE, "herstoryafrica.com.ng")}. If that wasn't you, or you have changed your mind, ${a("{{{unsubscribe_url}}}", "unsubscribe here")}.`,
    }),
  },
  {
    alias: "suggestion-accepted",
    name: "Suggestion accepted",
    from: FROM,
    reply_to: REPLY_TO,
    subject: "Your suggestion is now in the archive",
    variables: [
      { key: "name", type: "string", fallback_value: "there" },
      { key: "woman_name", type: "string", fallback_value: "her" },
      { key: "profile_url", type: "string", fallback_value: `${SITE}/women` },
    ],
    html: page({
      title: "Your suggestion is now in the archive",
      preview: "You told me about her. Her story is written and live now.",
      body: [
        p("Hi {{{name}}},"),
        p(
          "A while ago you asked me to add {{{woman_name}}} to HerStory Africa. " +
            "I went looking, read everything I could find, and wrote her story. It is live now.",
        ),
        button("{{{profile_url}}}", "Read her story"),
        p(
          "Thank you for pointing me to her. An archive like this only grows when someone asks, " +
            "\"what about her?\" If another woman comes to mind, the " +
            a(`${SITE}/suggest`, "suggestion form") +
            " is always open.",
        ),
        signature(),
      ].join("\n"),
      footer: transactionalFooter,
    }),
  },
  {
    alias: "suggestion-already-exists",
    name: "Suggestion already exists",
    from: FROM,
    reply_to: REPLY_TO,
    subject: "She's already in the archive",
    variables: [
      { key: "name", type: "string", fallback_value: "there" },
      { key: "woman_name", type: "string", fallback_value: "her" },
      { key: "profile_url", type: "string", fallback_value: `${SITE}/women` },
    ],
    html: page({
      title: "She's already in the archive",
      preview: "Good news: her full story is already written, and you can read it now.",
      body: [
        p("Hi {{{name}}},"),
        p(
          "Thank you for suggesting {{{woman_name}}}. Good news: she already has a full story in the archive, " +
            "so you can read it right now.",
        ),
        button("{{{profile_url}}}", "Read her story"),
        p(
          "If you know something about her that isn't there yet, reply to this email and tell me. " +
            "And if another woman comes to mind, the " +
            a(`${SITE}/suggest`, "suggestion form") +
            " is always open.",
        ),
        signature(),
      ].join("\n"),
      footer: transactionalFooter,
    }),
  },
];
