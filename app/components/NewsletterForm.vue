<template>
  <form v-if="!success" class="newsletter-form" novalidate @submit.prevent="subscribe">
    <div class="newsletter-form__field">
      <input
        v-model="email"
        type="email"
        :placeholder="placeholder"
        aria-label="Your email address"
        autocomplete="email"
        required
        class="newsletter-form__input"
        :class="{ 'newsletter-form__input--invalid': showValidationError }"
        :disabled="loading"
        :aria-invalid="showValidationError ? 'true' : undefined"
        @blur="touched = true"
      >
      <button
        type="submit"
        class="newsletter-form__btn"
        :class="{ 'newsletter-form__btn--loading': loading }"
        :disabled="loading || !isValidEmail"
      >
        <template v-if="loading">
          <LucideLoaderCircle :size="16" class="newsletter-form__spinner" />
          Subscribing…
        </template>
        <template v-else>Subscribe</template>
      </button>
    </div>
    <p v-if="showValidationError" class="newsletter-form__error" aria-live="polite">
      Enter a valid email address
    </p>
    <p v-else-if="error" class="newsletter-form__error" aria-live="polite">
      {{ error }}
    </p>
  </form>

  <div v-else class="newsletter-form__success" aria-live="polite">
    <LucideCheck :size="16" class="newsletter-form__check" />
    <p>{{ successMessage }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    placeholder?: string;
  }>(),
  {
    placeholder: "Enter your email",
  },
);

const emit = defineEmits<{
  subscribed: [email: string];
}>();

const { setSubscribed } = useApp();
const { track } = useTag();

const email = ref("");
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

const successMessage = computed(() =>
  alreadySubscribed.value
    ? "You're already part of the family."
    : "Check your email to confirm your subscription.",
);

async function subscribe() {
  if (!isValidEmail.value) {
    touched.value = true;
    return;
  }
  error.value = "";
  loading.value = true;

  try {
    const res = await $fetch<{ success: boolean; alreadySubscribed?: boolean }>(
      "/api/subscribe",
      {
        method: "POST",
        body: { email: email.value },
      },
    );

    success.value = true;
    alreadySubscribed.value = res.alreadySubscribed ?? false;
    setSubscribed(email.value);
    track("newsletter_subscribe", { already_subscribed: alreadySubscribed.value });
    emit("subscribed", email.value);
  } catch (err: unknown) {
    const message =
      (err as { data?: { message?: string } })?.data?.message ??
      "Something went wrong. Please try again.";
    error.value = message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.newsletter-form__field {
  display: flex;
  gap: 8px;
  width: 100%;
}

.newsletter-form__input {
  flex: 1;
  min-width: 0;
  height: 48px;
  padding: 0 16px;
  font-size: 15px;
  font-family: var(--font-body);
  color: var(--text-primary);
  background: var(--surface-elevated);
  border: 1.5px solid var(--border-default);
  border-radius: 8px;
  transition: border-color 0.15s ease;
}

.newsletter-form__input::placeholder {
  color: var(--text-muted);
}

.newsletter-form__input:focus {
  border-color: var(--ring-default);
  outline: 2px solid var(--ring-default);
  outline-offset: 2px;
  box-shadow: none;
}

.newsletter-form__input:disabled {
  color: var(--text-muted);
}

.newsletter-form__input--invalid,
.newsletter-form__input--invalid:focus {
  border-color: #e03232;
}

.newsletter-form__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  padding: 0 18px;
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-body);
  white-space: nowrap;
  color: var(--text-on-primary);
  background: var(--color-primary);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;
}

.newsletter-form__btn:hover:not(:disabled) {
  background: var(--color-primary-600);
}

.newsletter-form__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.newsletter-form__btn--loading:disabled {
  opacity: 0.7;
  cursor: progress;
}

.newsletter-form__spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.newsletter-form__error {
  font-size: 13px;
  color: #e03232;
  margin: 6px 0 0;
}

.newsletter-form__success {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 16px;
  border-radius: 8px;
  background: color-mix(in srgb, #2d8a52 12%, var(--surface));
  color: #2d8a52;
  font-size: 15px;
  font-weight: 600;
}

.newsletter-form__success p {
  margin: 0;
}

.newsletter-form__check {
  flex-shrink: 0;
}
</style>
