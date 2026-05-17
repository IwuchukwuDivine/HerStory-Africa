<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="reflection-overlay" @click.self="$emit('close')">
        <div class="reflection-modal">
          <div class="reflection-modal__header">
            <h2 class="reflection-modal__title">Share your reflection</h2>
            <button class="reflection-modal__close" aria-label="Close" @click="$emit('close')">
              <LucideX :size="20" />
            </button>
          </div>

          <div class="reflection-modal__controls">
            <div class="reflection-modal__toggle">
              <button
                :class="['reflection-modal__toggle-btn', { active: format === 'square' }]"
                @click="format = 'square'"
              >
                <LucideSquare :size="16" />
                Square
              </button>
              <button
                :class="['reflection-modal__toggle-btn', { active: format === 'story' }]"
                @click="format = 'story'"
              >
                <LucideSmartphone :size="16" />
                Story
              </button>
            </div>
            <div class="reflection-modal__toggle">
              <button
                :class="['reflection-modal__toggle-btn', { active: theme === 'light' }]"
                @click="theme = 'light'"
              >
                <LucideSun :size="16" />
                Light
              </button>
              <button
                :class="['reflection-modal__toggle-btn', { active: theme === 'dark' }]"
                @click="theme = 'dark'"
              >
                <LucideMoon :size="16" />
                Dark
              </button>
            </div>
          </div>

          <div
            class="reflection-modal__preview"
            :class="{ 'reflection-modal__preview--story': format === 'story' }"
          >
            <canvas ref="canvasRef" class="reflection-modal__canvas" />
            <div v-if="rendering" class="reflection-modal__loading">
              <LucideLoader2 :size="32" class="reflection-modal__spinner" />
              Generating card…
            </div>
          </div>

          <div class="reflection-modal__actions">
            <button
              class="reflection-modal__btn reflection-modal__btn--secondary"
              :disabled="rendering"
              @click="handleDownload"
            >
              <LucideDownload :size="18" />
              Download
            </button>
            <button
              class="reflection-modal__btn reflection-modal__btn--primary"
              :disabled="rendering"
              @click="handleShare"
            >
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
import type { CardFormat, CardTheme } from '~/utils/drawReflectionCard'
import { drawReflectionCard } from '~/utils/drawReflectionCard'
import { useDark } from '@vueuse/core'

const props = defineProps<{
  open: boolean
  prompt: string
  response: string
  articleTitle: string
  articleSlug: string
}>()

defineEmits<{ close: [] }>()

const isDark = useDark({ initialValue: 'light' })
const canvasRef = ref<HTMLCanvasElement | null>(null)
const format = ref<CardFormat>('square')
const theme = ref<CardTheme>('light')
const rendering = ref(false)

let lastBlob: Blob | null = null

async function renderCard() {
  if (!canvasRef.value || !props.open) return
  rendering.value = true

  try {
    drawReflectionCard(
      canvasRef.value,
      { prompt: props.prompt, response: props.response, articleTitle: props.articleTitle },
      format.value,
      theme.value,
    )

    lastBlob = await new Promise<Blob | null>(resolve =>
      canvasRef.value!.toBlob(blob => resolve(blob), 'image/png'),
    )
  }
  finally {
    rendering.value = false
  }
}

async function handleDownload() {
  if (!lastBlob) return
  const url = URL.createObjectURL(lastBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `herstory-reflection-${props.articleSlug}.png`
  a.click()
  URL.revokeObjectURL(url)
}

async function handleShare() {
  if (!lastBlob) return
  const file = new File([lastBlob], `herstory-reflection-${props.articleSlug}.png`, { type: 'image/png' })
  const articleUrl = `${window.location.origin}/articles/${props.articleSlug}`

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: `${props.articleTitle} — HerStory Africa`,
        text: `"${props.response}"\n\nInspired by: ${props.articleTitle}`,
        url: articleUrl,
        files: [file],
      })
    }
    catch { /* user cancelled share dialog */ }
    return
  }

  handleDownload()
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    theme.value = isDark.value ? 'dark' : 'light'
    nextTick(renderCard)
  }
})

watch([format, theme], () => {
  if (props.open) nextTick(renderCard)
})
</script>

<style scoped>
.reflection-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay-default);
  padding: 1rem;
}

.reflection-modal {
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

.reflection-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reflection-modal__title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  color: var(--text-primary);
  margin: 0;
}

.reflection-modal__close {
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

.reflection-modal__close:hover {
  color: var(--text-primary);
}

.reflection-modal__controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.reflection-modal__toggle {
  display: flex;
  background: var(--surface-muted);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.reflection-modal__toggle-btn {
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
  transition: background 0.2s, color 0.2s;
}

.reflection-modal__toggle-btn.active {
  background: var(--surface-elevated);
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.reflection-modal__preview {
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

.reflection-modal__preview--story {
  aspect-ratio: 9 / 16;
  max-height: 60vh;
  width: auto;
}

.reflection-modal__canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.reflection-modal__loading {
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

.reflection-modal__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.reflection-modal__actions {
  display: flex;
  gap: 0.75rem;
}

.reflection-modal__btn {
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
  transition: background 0.2s, opacity 0.2s;
}

.reflection-modal__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reflection-modal__btn--secondary {
  background: var(--surface-muted);
  color: var(--text-secondary);
}

.reflection-modal__btn--secondary:hover:not(:disabled) {
  background: var(--surface-subtle);
}

.reflection-modal__btn--primary {
  background: var(--color-primary, #b5451b);
  color: var(--text-on-primary);
}

.reflection-modal__btn--primary:hover:not(:disabled) {
  opacity: 0.9;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .reflection-modal,
.modal-leave-active .reflection-modal {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .reflection-modal {
  transform: scale(0.95) translateY(10px);
}

.modal-leave-to .reflection-modal {
  transform: scale(0.95) translateY(10px);
}
</style>
