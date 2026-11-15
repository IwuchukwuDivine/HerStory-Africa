// The Resend-hosted templates, addressed by alias from the server:
//   newsletter-welcome         server/utils/subscribers.ts
//   suggestion-accepted        server/utils/resend.ts
//   suggestion-already-exists  server/utils/resend.ts
//
// Change the copy here, then run `npm run resend:setup` to push and publish.
// Copy follows the house style in CLAUDE.md: no dashes, no AI phrasing.

import { SITE, a, button, p, page, signature } from "./base.mjs";

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
    html: page({
      title: "Welcome to the HerStory Africa newsletter",
      preview: "Twice a month, the story of an African woman worth knowing. Here is what to expect.",
      body: [
        p("Hello,"),
        p("Thank you for joining the HerStory Africa newsletter. I'm Deevyn, and I write it."),
        p(
          "Here is what to expect. Twice a month, a new edition arrives with the story of an African woman worth knowing: " +
            "the moment, the decision or the detail that made her matter.",
        ),
        p("You don't have to wait for the next one. Past editions are waiting for you, and every woman in the archive has her full story there too."),
        button(`${SITE}/newsletter/archive`, "Explore past editions"),
        p("If a story stays with you, reply and tell me. I read every one."),
        signature(),
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
