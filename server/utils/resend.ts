// Suggestion emails are Resend-hosted templates. The HTML, the subject and the
// sender all live in the Resend dashboard; this file only posts a template
// reference plus its variables. No markup lives in this repo.
//
// Templates are addressed by alias rather than UUID — an alias is a stable
// referenceable slug, so the dashboard can be reorganised without a deploy.
//
//   suggestion-accepted        → "Suggestion Accepted"
//   suggestion-already-exists  → "Suggestion Already Exists"
//
// Variable keys are case-sensitive and must match the template definition
// exactly. Both templates declare: name, woman_name, profile_url.
const TEMPLATE = {
  accepted: "suggestion-accepted",
  exists: "suggestion-already-exists",
} as const;

interface SuggestionEmail {
  to: string;
  name?: string;
  woman: string;
  url: string;
  /** Issue number, used to build the idempotency key. */
  issueNumber: number;
}

function sendTemplate(
  template: (typeof TEMPLATE)[keyof typeof TEMPLATE],
  opts: SuggestionEmail,
) {
  const { resendApiKey } = useRuntimeConfig();

  if (!resendApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Email service is not configured.",
    });
  }

  return $fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      // A retry of the same action on the same issue will not double-send
      // within Resend's 24 hour idempotency window.
      "Idempotency-Key": `${template}/${opts.issueNumber}`,
    },
    body: {
      to: [opts.to],
      // `from` comes from the template. Reply-to is set here because the
      // accepted template does not carry one, and replies to a suggestion
      // notification should reach a human.
      reply_to: "dee@herstoryafrica.com.ng",
      // `template` is mutually exclusive with html/text/react.
      template: {
        id: template,
        variables: {
          name: opts.name?.trim() || "there", // → "Hi there,"
          woman_name: opts.woman,
          profile_url: opts.url,
        },
      },
    },
  });
}

/** Her profile has just been researched and published. */
export async function sendAcceptanceEmail(opts: SuggestionEmail) {
  return sendTemplate(TEMPLATE.accepted, opts);
}

/**
 * She was already in the archive, so the suggestion needed no new profile.
 * The URL points at the page she already has.
 */
export async function sendExistsEmail(opts: SuggestionEmail) {
  return sendTemplate(TEMPLATE.exists, opts);
}
