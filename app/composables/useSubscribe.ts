/**
 * Newsletter signup state and the request behind it. Shared by
 * NewsletterForm and the /links page so the endpoint, the store update and
 * the tracking event live in one place.
 */
export default function useSubscribe() {
  const { setSubscribed } = useApp();
  const { track } = useTag();

  const email = ref("");
  // Honeypot value: people never see the field, bots fill it in.
  const website = ref("");
  const loading = ref(false);
  const success = ref(false);
  const alreadySubscribed = ref(false);
  const error = ref("");
  const touched = ref(false);

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValidEmail = computed(() => emailPattern.test(email.value));
  const showValidationError = computed(
    () => touched.value && email.value.length > 0 && !isValidEmail.value,
  );

  /** Resolves true when the address was accepted. */
  async function subscribe(): Promise<boolean> {
    if (!isValidEmail.value) {
      touched.value = true;
      return false;
    }
    error.value = "";
    loading.value = true;

    try {
      const res = await $fetch<{ success: boolean; alreadySubscribed?: boolean }>(
        "/api/subscribe",
        {
          method: "POST",
          body: { email: email.value, website: website.value },
        },
      );

      success.value = true;
      alreadySubscribed.value = res.alreadySubscribed ?? false;
      setSubscribed(email.value);
      track("newsletter_subscribe", { already_subscribed: alreadySubscribed.value });
      return true;
    } catch (err: unknown) {
      error.value =
        (err as { data?: { message?: string } })?.data?.message ??
        "Something went wrong. Please try again.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    email,
    website,
    loading,
    success,
    alreadySubscribed,
    error,
    touched,
    isValidEmail,
    showValidationError,
    subscribe,
  };
}
