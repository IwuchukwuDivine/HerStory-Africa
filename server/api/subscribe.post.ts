export default defineEventHandler(async (event) => {
  const { buttondownApiKey } = useRuntimeConfig();
  const body = await readBody<{ email: string }>(event);

  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid email is required.",
    });
  }

  if (!buttondownApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Newsletter service is not configured.",
    });
  }

  try {
    await $fetch("https://api.buttondown.com/v1/subscribers", {
      method: "POST",
      headers: { Authorization: `Token ${buttondownApiKey}` },
      body: { email_address: body.email },
    });

    return { success: true };
  } catch (error: unknown) {
    const status =
      (error as { response?: { status?: number } })?.response?.status ??
      (error as { statusCode?: number })?.statusCode;

    if (status === 400) {
      return { success: true, alreadySubscribed: true };
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong. Please try again later.",
    });
  }
});
