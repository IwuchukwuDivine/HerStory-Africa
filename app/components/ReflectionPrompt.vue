<template>
  <ClientOnly>
    <aside class="reflection">
      <div class="reflection__accent" />
      <div class="reflection__body">
        <div class="reflection__header">
          <LucideMessageCircleHeart :size="20" class="reflection__icon" />
          <h3 class="reflection__title">Over to you</h3>
        </div>
        <p class="reflection__prompt">{{ prompt }}</p>

        <div v-if="!saved" class="reflection__form">
          <textarea
            v-model="draft"
            class="reflection__textarea"
            rows="3"
            placeholder="Write your answer here…"
            maxlength="500"
          />
          <div class="reflection__actions">
            <span class="reflection__counter">{{ draft.length }}/500</span>
            <button
              class="reflection__save"
              :disabled="!draft.trim()"
              @click="save"
            >
              <LucideCheck :size="16" />
              Save
            </button>
          </div>
        </div>

        <div v-else class="reflection__saved">
          <blockquote class="reflection__response">
            {{ savedResponse }}
          </blockquote>
          <div class="reflection__saved-actions">
            <button class="reflection__action-btn" @click="edit">
              <LucidePencil :size="14" />
              Edit
            </button>
            <button class="reflection__action-btn reflection__action-btn--primary" @click="cardOpen = true">
              <LucideImage :size="14" />
              Share as card
            </button>
          </div>
        </div>
      </div>
    </aside>

    <ReflectionCardModal
      :open="cardOpen"
      :prompt="prompt"
      :response="savedResponse"
      :article-title="articleTitle"
      :article-slug="slug"
      @close="cardOpen = false"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
const props = defineProps<{
  prompt: string
  slug: string
  articleTitle: string
}>()

const { saveReflection, getReflection } = useApp()

const savedResponse = ref(getReflection(props.slug))
const saved = ref(!!savedResponse.value)
const draft = ref('')
const cardOpen = ref(false)

function save() {
  const trimmed = draft.value.trim()
  if (!trimmed) return
  saveReflection(props.slug, trimmed)
  savedResponse.value = trimmed
  saved.value = true
}

function edit() {
  draft.value = savedResponse.value
  saved.value = false
}
</script>

<style scoped>
.reflection {
  margin-top: 3rem;
  border: 1px solid var(--border-light);
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--surface-muted);
}

.reflection__accent {
  height: 3px;
  background: linear-gradient(90deg, var(--color-secondary), var(--color-primary));
}

.reflection__body {
  padding: 1.75rem;
}

.reflection__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.reflection__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.reflection__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.reflection__prompt {
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 1.25rem;
  font-style: italic;
}

.reflection__textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-family: var(--font-body);
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--surface-elevated, var(--surface-default, #fff));
  border: 1.5px solid var(--border-default);
  border-radius: 0.625rem;
  resize: vertical;
  transition: border-color 0.15s ease;
}

.reflection__textarea::placeholder {
  color: var(--text-muted);
}

.reflection__textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.reflection__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
}

.reflection__counter {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.reflection__save {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: none;
  background: var(--color-primary);
  color: var(--text-on-primary);
  cursor: pointer;
  transition: background 0.15s ease;
}

.reflection__save:hover:not(:disabled) {
  background: var(--color-primary-600);
}

.reflection__save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.reflection__saved {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reflection__response {
  margin: 0;
  padding: 1rem 1.25rem;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-primary);
  background: var(--surface-elevated, var(--surface-default, #fff));
  border-left: 3px solid var(--color-primary);
  border-radius: 0 0.5rem 0.5rem 0;
  font-style: italic;
}

.reflection__saved-actions {
  display: flex;
  gap: 0.75rem;
}

.reflection__action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: var(--surface-elevated, transparent);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.reflection__action-btn:hover {
  border-color: var(--ring-default);
  color: var(--color-primary);
}

.reflection__action-btn--primary {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--text-on-primary);
}

.reflection__action-btn--primary:hover {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
  color: var(--text-on-primary);
}
</style>
