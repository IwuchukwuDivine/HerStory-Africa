const REPO = "IwuchukwuDivine/HerStory-Africa";

export default defineEventHandler(async (event) => {
  const { githubToken } = useRuntimeConfig();

  const body = await readBody<{
    name: string;
    country?: string;
    reason: string;
    submitterName?: string;
    submitterEmail?: string;
  }>(event);

  if (!body.name?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "The woman's name is required.",
    });
  }

  if (!body.reason?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Please tell us why she should be featured.",
    });
  }

  if (!githubToken) {
    throw createError({
      statusCode: 500,
      statusMessage: "Suggestion service is not configured.",
    });
  }

  const issueBody = [
    `**Name:** ${body.name.trim()}`,
    body.country?.trim() ? `**Country / Region:** ${body.country.trim()}` : "",
    "",
    `**Why she should be featured:**`,
    body.reason.trim(),
    "",
    "---",
    body.submitterName?.trim()
      ? `Submitted by: ${body.submitterName.trim()}`
      : "Submitted anonymously",
    body.submitterEmail?.trim()
      ? `Contact: ${body.submitterEmail.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await $fetch(`https://api.github.com/repos/${REPO}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
      body: {
        title: `Suggestion: ${body.name.trim()}`,
        body: issueBody,
        labels: ["suggestion"],
      },
    });

    return { success: true };
  } catch (error: unknown) {
    const status =
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { statusCode?: number })?.statusCode;

    if (status === 401 || status === 403) {
      throw createError({
        statusCode: 500,
        statusMessage: "Suggestion service is not configured correctly.",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong. Please try again later.",
    });
  }
});
