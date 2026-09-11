<template>
  <div class="suggest">
    <header class="suggest__header">
      <MuseumLabel
        level="h1"
        eyebrow="Suggest a woman"
        title="Know an African woman whose story should be here?"
      />
      <p class="suggest__intro">
        We can't tell every story alone. If you know an African woman who
        fought, built, led, created, or changed something, tell us about her.
        The best suggestions come with a reason.
      </p>
    </header>

    <form
      v-if="status !== 'success'"
      class="suggest__form"
      @submit.prevent="submit"
    >
      <div class="suggest__field">
        <label for="name" class="suggest__label">Her name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="suggest__input"
          placeholder="e.g. Funmilayo Ransome-Kuti"
          autocomplete="off"
          required
        >
      </div>

      <div class="suggest__field">
        <label for="country" class="suggest__label">
          Country or region <span class="suggest__optional">· optional</span>
        </label>
        <input
          id="country"
          v-model="form.country"
          type="text"
          class="suggest__input"
          placeholder="e.g. Nigeria, West Africa"
          autocomplete="off"
        >
      </div>

      <div class="suggest__field">
        <label for="reason" class="suggest__label">Why should we feature her?</label>
        <textarea
          id="reason"
          v-model="form.reason"
          class="suggest__input suggest__textarea"
          placeholder="What did she do? Why does her story matter?"
          rows="6"
          required
        />
      </div>

      <div class="suggest__row">
        <div class="suggest__field">
          <label for="submitterName" class="suggest__label">
            Your name <span class="suggest__optional">· optional</span>
          </label>
          <input
            id="submitterName"
            v-model="form.submitterName"
            type="text"
            class="suggest__input"
            placeholder="Your name"
            autocomplete="name"
          >
        </div>

        <div class="suggest__field">
          <label for="submitterEmail" class="suggest__label">
            Your email <span class="suggest__optional">· optional</span>
          </label>
          <input
            id="submitterEmail"
            v-model="form.submitterEmail"
            type="email"
            class="suggest__input"
            placeholder="In case we'd like to follow up"
            autocomplete="email"
          >
        </div>
      </div>

      <p v-if="errorMessage" class="suggest__error" role="alert">
        <LucideAlertCircle :size="16" />
        {{ errorMessage }}
      </p>

      <Pill
        type="submit"
        variant="primary"
        size="lg"
        :loading="status === 'submitting'"
        class="suggest__submit"
      >
        <template #icon>
          <LucideSend :size="16" />
        </template>
        {{ status === "submitting" ? "Sending" : "Send suggestion" }}
      </Pill>
    </form>

    <div v-else class="panel suggest__success" aria-live="polite">
      <p class="tint-success suggest__success-row">
        <LucideCheck :size="16" />
        Thank you. We read every suggestion.
      </p>
      <p class="suggest__success-text">
        If her story fits the archive, we will research it, source it, and add
        her. That can take a few weeks.
      </p>
      <div class="suggest__success-actions">
        <Pill to="/women" variant="secondary">Browse the archive</Pill>
        <Pill variant="ghost" @click="reset">Suggest another woman</Pill>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const form = reactive({
  name: "",
  country: "",
  reason: "",
  submitterName: "",
  submitterEmail: "",
});

const status = ref<"idle" | "submitting" | "success">("idle");
const errorMessage = ref("");

async function submit() {
  errorMessage.value = "";

  if (!form.name.trim() || !form.reason.trim()) {
    errorMessage.value = "Please fill in her name and why she should be featured.";
    return;
  }

  status.value = "submitting";

  try {
    await $fetch("/api/suggest", {
      method: "POST",
      body: {
        name: form.name,
        country: form.country,
        reason: form.reason,
        submitterName: form.submitterName,
        submitterEmail: form.submitterEmail,
      },
    });

    status.value = "success";
  } catch {
    status.value = "idle";
    errorMessage.value = "Something went wrong. Please try again.";
  }
}

function reset() {
  form.name = "";
  form.country = "";
  form.reason = "";
  form.submitterName = "";
  form.submitterEmail = "";
  status.value = "idle";
  errorMessage.value = "";
}

const suggestDescription =
  "Know an African woman whose story should be in the archive? Suggest her and help us tell the stories history forgot.";

useSeoMeta({
  title: "Suggest a Woman",
  description: suggestDescription,
  ogTitle: "Suggest a Woman",
  ogDescription: suggestDescription,
  ogUrl: getAbsoluteUrl("/suggest"),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "Suggest a Woman",
  twitterDescription: suggestDescription,
});

defineOgImage("Card", {
  variant: "page",
  pill: "Suggest a woman",
  title: "Know an African woman whose story should be here?",
  description: suggestDescription,
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/suggest") }],
});
</script>

<style scoped>
.suggest {
  max-width: 48rem;
  margin: 0 auto;
  padding: 28px 24px 64px;
}

@media (min-width: 768px) {
  .suggest {
    padding: 40px 32px 64px;
  }
}

.suggest__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

.suggest__intro {
  max-width: 42rem;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

/* ── Form ── */
.suggest__form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 40rem;
}

.suggest__field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggest__label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.suggest__optional {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

.suggest__input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  font-size: 16px;
  font-family: var(--font-body);
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--surface-elevated);
  border: 1.5px solid var(--border-default);
  border-radius: 8px;
  transition: border-color 0.15s ease;
}

.suggest__input::placeholder {
  color: var(--text-muted);
}

.suggest__input:focus {
  border-color: var(--ring-default);
  outline: 2px solid var(--ring-default);
  outline-offset: 2px;
  box-shadow: none;
}

.suggest__textarea {
  height: auto;
  min-height: 160px;
  padding: 12px 14px;
  resize: vertical;
}

.suggest__row {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 480px) {
  .suggest__row {
    flex-direction: row;
    gap: 16px;
  }
}

.suggest__error {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-crimson);
  margin: 0;
}

.suggest__submit {
  align-self: flex-start;
}

/* ── Success ── */
.suggest__success {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 40rem;
}

.suggest__success-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.suggest__success-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.suggest__success-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
</style>
