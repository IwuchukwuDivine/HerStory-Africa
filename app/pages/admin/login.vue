<template>
  <div class="admin-login">
    <div class="admin-login__card">
      <div class="admin-login__brand">
        <span class="admin-login__brand-her">Her</span>Story
        <span class="admin-login__brand-africa">Africa</span>
      </div>
      <h1 class="admin-login__title">Admin access</h1>
      <p class="admin-login__lead">Enter the passphrase to continue.</p>

      <form class="admin-login__form" @submit.prevent="submit">
        <div class="admin-login__field">
          <label for="passphrase" class="admin-login__label">Passphrase</label>
          <input
            id="passphrase"
            v-model="passphrase"
            type="password"
            class="admin-login__input"
            placeholder="••••••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <p v-if="errorMessage" class="admin-login__error">
          <LucideAlertCircle :size="16" />
          {{ errorMessage }}
        </p>

        <button type="submit" class="admin-login__submit" :disabled="loading">
          <LucideLoader2
            v-if="loading"
            :size="18"
            class="admin-login__spinner"
          />
          <LucideLock v-else :size="18" />
          {{ loading ? "Checking…" : "Enter" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" });

const passphrase = ref("");
const loading = ref(false);
const errorMessage = ref("");
const route = useRoute();

async function submit() {
  errorMessage.value = "";
  loading.value = true;

  try {
    await $fetch("/api/admin/login", {
      method: "POST",
      body: { passphrase: passphrase.value },
    });
    const next =
      typeof route.query.next === "string" ? route.query.next : "/admin";
    await navigateTo(next);
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode;
    errorMessage.value =
      status === 429
        ? "Too many attempts. Please wait a while and try again."
        : "Incorrect passphrase.";
    loading.value = false;
  }
}

useHead({ title: "Admin" });
</script>

<style scoped>
.admin-login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 1.5rem;
}

.admin-login__card {
  width: 100%;
  max-width: 26rem;
  padding: 2.5rem 2rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border-light);
  border-radius: 1.25rem;
  box-shadow: var(--shadow-card);
}

.admin-login__brand {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.admin-login__brand-her {
  color: var(--color-primary);
}

.admin-login__brand-africa {
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--color-secondary);
  margin-left: 0.25rem;
  vertical-align: middle;
}

.admin-login__title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.admin-login__lead {
  font-size: 0.9375rem;
  color: var(--text-muted);
  margin: 0.375rem 0 1.75rem;
}

.admin-login__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.admin-login__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.admin-login__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.admin-login__input {
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  color: var(--text-primary);
  background: var(--surface);
  border: 1.5px solid var(--border-light);
  border-radius: 0.75rem;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.admin-login__input::placeholder {
  color: var(--text-muted);
}

.admin-login__input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-50);
}

.admin-login__error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-crimson);
  margin: 0;
}

.admin-login__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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

.admin-login__submit:hover:not(:disabled) {
  background: var(--color-primary-600);
  transform: translateY(-1px);
}

.admin-login__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.admin-login__spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
