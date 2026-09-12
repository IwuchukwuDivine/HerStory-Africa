<template>
  <ClientOnly>
    <aside class="panel reflection" aria-labelledby="reflection-heading">
      <div class="label">
        <span class="rule" />
        <h3 id="reflection-heading" class="eyebrow eyebrow--gold reflection__eyebrow">Over to you</h3>
      </div>
      <p class="reflection__prompt">{{ prompt }}</p>

      <div v-if="!saved" class="reflection__form">
        <textarea
          v-model="draft"
          class="reflection__textarea"
          rows="3"
          placeholder="Write your answer here…"
          maxlength="500"
          aria-label="Your reflection"
        />
        <div class="reflection__actions">
          <span class="reflection__counter">{{ draft.length }}/500</span>
          <Pill variant="primary" :disabled="!draft.trim()" @click="save">
            <template #icon>
              <LucideCheck :size="16" />
            </template>
            Save
          </Pill>
        </div>
      </div>

      <div v-else class="reflection__saved">
        <blockquote class="reflection__response">
          {{ savedResponse }}
        </blockquote>
        <div class="reflection__saved-actions">
          <Pill variant="secondary" @click="edit">
            <template #icon>
              <LucidePencil :size="16" />
            </template>
            Edit
          </Pill>
          <Pill variant="secondary" @click="cardOpen = true">
            <template #icon>
              <LucideImage :size="16" />
            </template>
            Share as card
          </Pill>
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
  prompt: string;
  slug: string;
  articleTitle: string;
}>();

const { saveReflection, getReflection } = useApp();
const { track } = useTag();

const savedResponse = ref(getReflection(props.slug));
const saved = ref(!!savedResponse.value);
const draft = ref("");
const cardOpen = ref(false);

function save() {
  const trimmed = draft.value.trim();
  if (!trimmed) return;
  saveReflection(props.slug, trimmed);
  savedResponse.value = trimmed;
  saved.value = true;
  track("reflection_save", { slug: props.slug });
}

function edit() {
  draft.value = savedResponse.value;
  saved.value = false;
}
</script>

<style scoped>
.reflection {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reflection__eyebrow {
  margin: 0;
}

.reflection__prompt {
  font-size: 19px;
  font-weight: 600;
  font-style: italic;
  line-height: 1.4;
  color: var(--text-primary);
  margin: 0;
}

.reflection__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reflection__textarea {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  font-size: 16px;
  font-family: var(--font-body);
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--surface-elevated);
  border: 1.5px solid var(--border-default);
  border-radius: 8px;
  resize: vertical;
  transition: border-color 0.15s ease;
}

.reflection__textarea::placeholder {
  color: var(--text-muted);
}

.reflection__textarea:focus-visible {
  outline: 2px solid var(--ring-default);
  outline-offset: 2px;
  border-color: var(--ring-default);
}

.reflection__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.reflection__counter {
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.reflection__saved {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reflection__response {
  margin: 0;
  padding: 16px 20px;
  font-size: 17px;
  line-height: 1.7;
  font-style: italic;
  color: var(--text-primary);
  background: var(--surface-elevated);
  border-left: 3px solid var(--color-secondary);
  border-radius: 0 8px 8px 0;
}

.reflection__saved-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
