<template>
  <div class="suggest">
    <header class="suggest__header">
      <h1 class="suggest__title">Suggest a Woman</h1>
      <p class="suggest__lead">
        We can't tell every story alone. If you know an African woman whose story
        deserves to be here, someone who fought, built, led, created, or changed
        something, tell us about her. The best suggestions come with a reason.
      </p>
    </header>

    <form
      v-if="status !== 'success'"
      class="suggest__form"
      @submit.prevent="submit"
    >
      <div class="suggest__field">
        <label for="name" class="suggest__label">Her name *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="suggest__input"
          placeholder="e.g. Funmilayo Ransome-Kuti"
          required
        />
      </div>

      <div class="suggest__field">
        <label for="country" class="suggest__label">
          Country or region
          <span class="suggest__optional">optional</span>
        </label>
        <input
          id="country"
          v-model="form.country"
          type="text"
          class="suggest__input"
          placeholder="e.g. Nigeria, West Africa"
        />
      </div>

      <div class="suggest__field">
        <label for="reason" class="suggest__label">
          Why should we feature her? *
        </label>
        <textarea
          id="reason"
          v-model="form.reason"
          class="suggest__textarea"
          placeholder="What did she do? Why does her story matter?"
          rows="5"
          required
        />
      </div>

      <div class="suggest__row">
        <div class="suggest__field">
          <label for="submitterName" class="suggest__label">
            Your name
            <span class="suggest__optional">optional</span>
          </label>
          <input
            id="submitterName"
            v-model="form.submitterName"
            type="text"
            class="suggest__input"
            placeholder="Your name"
          />
        </div>

        <div class="suggest__field">
          <label for="submitterEmail" class="suggest__label">
            Your email
            <span class="suggest__optional">optional</span>
          </label>
          <input
            id="submitterEmail"
            v-model="form.submitterEmail"
            type="email"
            class="suggest__input"
            placeholder="In case we'd like to follow up"
          />
        </div>
      </div>

      <p v-if="errorMessage" class="suggest__error">
        <LucideAlertCircle :size="16" />
        {{ errorMessage }}
      </p>

      <button
        type="submit"
        class="suggest__submit"
        :disabled="status === 'submitting'"
      >
        <LucideLoader2
          v-if="status === 'submitting'"
          :size="18"
          class="suggest__spinner"
        />
        <LucideSend v-else :size="18" />
        {{ status === "submitting" ? "Sending..." : "Submit suggestion" }}
      </button>
    </form>

    <div v-else class="suggest__success">
      <LucideCheckCircle2 :size="48" class="suggest__success-icon" />
      <h2 class="suggest__success-title">Thank you</h2>
      <p class="suggest__success-text">
        Your suggestion has been received. We read every single one and will
        research her story. If she's a good fit, she'll appear in the archive.
      </p>
      <button class="suggest__another" @click="reset">
        Suggest another woman
      </button>
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
  ogImage: getAbsoluteUrl("/suggest-og.png"),
  ogUrl: getAbsoluteUrl("/suggest"),
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "Suggest a Woman",
  twitterDescription: suggestDescription,
  twitterImage: getAbsoluteUrl("/suggest-og.png"),
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/suggest") }],
});
</script>

<style scoped>
.suggest {
  max-width: 40rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

@media (min-width: 768px) {
  .suggest {
    padding: 3rem 2rem 5rem;
  }
}

.suggest__header {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-light);
}

.suggest__title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.suggest__lead {
  font-size: 1.0625rem;
  line-height: 1.75;
  color: var(--text-secondary);
  margin: 1rem 0 0;
}

/* ── Form ── */
.suggest__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.suggest__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 1;
}

.suggest__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.suggest__optional {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-muted);
}

.suggest__input,
.suggest__textarea {
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--surface-elevated);
  border: 1.5px solid var(--border-light);
  border-radius: 0.75rem;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.suggest__input::placeholder,
.suggest__textarea::placeholder {
  color: var(--text-muted);
}

.suggest__input:focus,
.suggest__textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-50);
}

.suggest__textarea {
  resize: vertical;
  min-height: 7rem;
}

.suggest__row {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 480px) {
  .suggest__row {
    flex-direction: row;
    gap: 1rem;
  }
}

/* ── Error ── */
.suggest__error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-error, #dc2626);
  margin: 0;
}

/* ── Submit button ── */
.suggest__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  align-self: flex-start;
  padding: 0.75rem 1.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--text-on-primary);
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.15s ease,
    opacity 0.15s ease;
}

.suggest__submit:hover:not(:disabled) {
  background: var(--color-primary-600);
  transform: translateY(-1px);
}

.suggest__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.suggest__spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Success state ── */
.suggest__success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 0;
}

.suggest__success-icon {
  color: var(--color-success, #16a34a);
  margin-bottom: 1rem;
}

.suggest__success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.suggest__success-text {
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 1.5rem;
  max-width: 28rem;
}

.suggest__another {
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1.5px solid var(--border-light);
  border-radius: 9999px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.suggest__another:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
