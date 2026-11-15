<template>
  <div class="unsub">
    <MuseumLabel level="h1" eyebrow="Newsletter" :title="copy.title" />

    <p class="unsub__intro">{{ copy.text }}</p>

    <p v-if="error" class="unsub__error" role="alert">{{ error }}</p>

    <div class="unsub__actions">
      <Pill
        v-if="state === 'ready'"
        variant="primary"
        :loading="working"
        @click="confirm"
      >
        Unsubscribe me
      </Pill>
      <Pill v-if="state === 'done'" to="/newsletter" variant="primary">
        Changed your mind? Subscribe again
      </Pill>
      <Pill to="/newsletter/archive" variant="secondary">Explore past editions</Pill>
      <Pill to="/" variant="ghost">Home</Pill>
    </div>
  </div>
</template>

<script setup lang="ts">
// The link in every newsletter footer and the welcome email lands here with a
// signed token. Nothing happens until the reader clicks, because mail
// scanners open every link in an email and would otherwise unsubscribe them.

type State = "ready" | "done" | "invalid" | "test";

const route = useRoute();
const token = computed(() => String(route.query.t ?? ""));

const state = ref<State>("ready");
const working = ref(false);
const error = ref("");

// The page is prerendered without a token, so the state is settled on the client.
onMounted(() => {
  if (!token.value) state.value = "invalid";
  else if (token.value === "test") state.value = "test";
});

const COPY: Record<State, { title: string; text: string }> = {
  ready: {
    title: "Leave the newsletter?",
    text: "One click and you will not hear from us again. No more editions, no follow-up asking why.",
  },
  done: {
    title: "You're unsubscribed.",
    text: "No more editions will reach you. Every story stays in the archive whenever you want it.",
  },
  invalid: {
    title: "This link doesn't work.",
    text: "It may have been cut short by your email app. Reply to any of our emails with the word unsubscribe and we will take you off the list.",
  },
  test: {
    title: "This was a test send.",
    text: "Links in test sends and previews don't unsubscribe anyone. In a real edition this link takes the reader off the list.",
  },
};
const copy = computed(() => COPY[state.value]);

async function confirm() {
  working.value = true;
  error.value = "";
  try {
    await $fetch("/api/newsletter/unsubscribe", {
      method: "POST",
      body: { t: token.value },
    });
    state.value = "done";
    useApp().setSubscribed("");
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 400) state.value = "invalid";
    else error.value = "That didn't go through. Please try again in a minute.";
  } finally {
    working.value = false;
  }
}

useSeoMeta({
  title: "Unsubscribe",
  description: "Stop receiving the HerStory Africa newsletter.",
  robots: "noindex, nofollow",
});

defineOgImage("Card", {
  variant: "page",
  pill: "Newsletter",
  title: "Unsubscribe",
  description: "Stop receiving the HerStory Africa newsletter.",
});
</script>

<style scoped>
.unsub {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 48rem;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

@media (min-width: 768px) {
  .unsub {
    padding: 64px 32px 80px;
  }
}

.unsub__intro {
  max-width: 42rem;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.unsub__error {
  font-size: 14px;
  color: var(--color-crimson-600);
  margin: 0;
}

:global(.dark) .unsub__error {
  color: var(--color-crimson-300);
}

.unsub__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
</style>
