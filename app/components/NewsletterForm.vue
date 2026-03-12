<template>
  <form v-if="!success" class="newsletter-form" @submit.prevent="subscribe">
    <div class="newsletter-form__field">
      <input
        v-model="email"
        type="email"
        :placeholder="placeholder"
        required
        class="newsletter-form__input"
        :disabled="loading"
      />
      <button
        type="submit"
        class="newsletter-form__btn"
        :disabled="loading || !email.trim()"
      >
        <LucideLoader2
          v-if="loading"
          :size="16"
          class="newsletter-form__spinner"
        />
        <template v-else>Subscribe</template>
      </button>
    </div>
    <p v-if="error" class="newsletter-form__error">
      {{ error }}
    </p>
  </form>

  <div v-else class="newsletter-form__success">
    <LucideCheck :size="20" class="newsletter-form__check" />
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

const email = ref("");
const loading = ref(false);
const success = ref(false);
const alreadySubscribed = ref(false);
const error = ref("");

const successMessage = computed(() =>
  alreadySubscribed.value
    ? "You're already part of the family!"
    : "Welcome aboard! Check your inbox for a confirmation email.",
);

async function subscribe() {
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
  gap: 0.5rem;
  width: 100%;
}

.newsletter-form__input {
  flex: 1;
  min-width: 0;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  font-family: var(--font-body);
  color: var(--text-primary);
  background: var(--surface-elevated);
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
  transition: border-color 0.15s ease;
}

.newsletter-form__input::placeholder {
  color: var(--text-muted);
}

.newsletter-form__input:focus {
  border-color: var(--color-primary);
}

.newsletter-form__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: var(--font-body);
  white-space: nowrap;
  color: var(--text-on-primary);
  background: var(--color-primary);
  border: none;
  border-radius: 0.5rem;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.newsletter-form__spinner {
  animation: spin 0.8s linear infinite;
}

.newsletter-form__error {
  font-size: 0.8125rem;
  color: var(--color-crimson);
  margin: 0.5rem 0 0;
}

.newsletter-form__success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-forest);
}

.newsletter-form__success p {
  margin: 0;
}

.newsletter-form__check {
  flex-shrink: 0;
}
</style>
