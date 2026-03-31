<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="share-card-overlay" @click.self="$emit('close')">
        <div class="share-card-modal">
          <div class="share-card-modal__header">
            <h2 class="share-card-modal__title">Create Share Card</h2>
            <button class="share-card-modal__close" aria-label="Close" @click="$emit('close')">
              <LucideX :size="20" />
            </button>
          </div>

          <div class="share-card-modal__controls">
            <div class="share-card-modal__toggle">
              <button
                :class="['share-card-modal__toggle-btn', { active: format === 'square' }]"
                @click="format = 'square'"
              >
                <LucideSquare :size="16" />
                Square
              </button>
              <button
                :class="['share-card-modal__toggle-btn', { active: format === 'story' }]"
                @click="format = 'story'"
              >
                <LucideSmartphone :size="16" />
                Story
              </button>
            </div>
            <div class="share-card-modal__toggle">
              <button
                :class="['share-card-modal__toggle-btn', { active: theme === 'light' }]"
                @click="theme = 'light'"
              >
                <LucideSun :size="16" />
                Light
              </button>
              <button
                :class="['share-card-modal__toggle-btn', { active: theme === 'dark' }]"
                @click="theme = 'dark'"
              >
                <LucideMoon :size="16" />
                Dark
              </button>
            </div>
          </div>

          <div class="share-card-modal__preview" :class="{ 'share-card-modal__preview--story': format === 'story' }">
            <canvas ref="canvasRef" class="share-card-modal__canvas" />
            <div v-if="rendering" class="share-card-modal__loading">
              <LucideLoader2 :size="32" class="share-card-modal__spinner" />
              Generating card…
            </div>
          </div>

          <p v-if="error" class="share-card-modal__error">
            {{ error }}
          </p>

          <div class="share-card-modal__actions">
            <button class="share-card-modal__btn share-card-modal__btn--secondary" :disabled="rendering" @click="handleDownload">
              <LucideDownload :size="18" />
              Download
            </button>
            <button class="share-card-modal__btn share-card-modal__btn--primary" :disabled="rendering" @click="handleShare">
              <LucideShare2 :size="18" />
              Share
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { CardFormat, CardTheme } from '~/utils/drawShareCard'
import type { Woman } from '~/utils/types/content'
import { useDark } from '@vueuse/core'

const props = defineProps<{
  open: boolean
  woman: Woman
}>()

defineEmits<{
  close: []
}>()

const isDark = useDark({ initialValue: 'light' })
const canvasRef = ref<HTMLCanvasElement | null>(null)
const format = ref<CardFormat>('square')
const theme = ref<CardTheme>('light')

const { rendering, error, render, download, share } = useShareCard()

let lastBlob: Blob | null = null

const cardData = computed(() => ({
  name: props.woman.name,
  country: props.woman.country,
  era: props.woman.era,
  summary: props.woman.summary,
  born: props.woman.born,
  died: props.woman.died,
  imageUrl: props.woman.image,
}))

async function renderCard() {
  if (!canvasRef.value || !props.open) return
  lastBlob = await render(canvasRef.value, cardData.value, format.value, theme.value)
}

async function handleDownload() {
  if (!lastBlob) return
  const slug = props.woman.slug || props.woman.name.toLowerCase().replace(/\s+/g, '-')
  await download(lastBlob, `herstory-${slug}`)
}

async function handleShare() {
  if (!lastBlob) return
  const slug = props.woman.slug || props.woman.name.toLowerCase().replace(/\s+/g, '-')
  await share(lastBlob, `herstory-${slug}`, slug)
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    theme.value = isDark.value ? 'dark' : 'light'
    nextTick(renderCard)
  }
})

watch([format, theme], () => {
  if (props.open) {
    nextTick(renderCard)
  }
})
</script>

<style scoped>
.share-card-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay-default);
  padding: 1rem;
}

.share-card-modal {
  background: var(--surface-elevated);
  border-radius: 16px;
  border: 1px solid var(--border-default);
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.share-card-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.share-card-modal__title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  color: var(--text-primary);
  margin: 0;
}

.share-card-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
}

.share-card-modal__close:hover {
  color: var(--text-primary);
}

.share-card-modal__controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.share-card-modal__toggle {
  display: flex;
  background: var(--surface-muted);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.share-card-modal__toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8125rem;
  font-family: var(--font-body);
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.share-card-modal__toggle-btn.active {
  background: var(--surface-elevated);
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.share-card-modal__preview {
  position: relative;
  background: var(--surface-muted);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  margin: 0 auto;
  width: 100%;
}

.share-card-modal__preview--story {
  aspect-ratio: 9 / 16;
  max-height: 60vh;
  width: auto;
}

.share-card-modal__canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.share-card-modal__loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: var(--overlay-default);
  color: var(--text-on-primary);
  font-size: 0.875rem;
}

.share-card-modal__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.share-card-modal__error {
  color: var(--color-crimson, #e03232);
  font-size: 0.8125rem;
  margin: 0;
}

.share-card-modal__actions {
  display: flex;
  gap: 0.75rem;
}

.share-card-modal__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 10px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s,
    opacity 0.2s;
}

.share-card-modal__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.share-card-modal__btn--secondary {
  background: var(--surface-muted);
  color: var(--text-secondary);
}

.share-card-modal__btn--secondary:hover:not(:disabled) {
  background: var(--surface-subtle);
}

.share-card-modal__btn--primary {
  background: var(--color-primary, #b5451b);
  color: var(--text-on-primary);
}

.share-card-modal__btn--primary:hover:not(:disabled) {
  opacity: 0.9;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .share-card-modal,
.modal-leave-active .share-card-modal {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .share-card-modal {
  transform: scale(0.95) translateY(10px);
}

.modal-leave-to .share-card-modal {
  transform: scale(0.95) translateY(10px);
}
</style>
