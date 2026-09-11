<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="sheet-overlay" @click.self="emit('close')">
        <div
          class="sheet share-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-sheet-title"
        >
          <span class="sheet__handle" aria-hidden="true" />

          <div class="share-sheet__head">
            <h2 id="share-sheet-title" class="sheet__title">Spread her story</h2>
            <button class="icon-btn" type="button" aria-label="Close" @click="emit('close')">
              <LucideX :size="20" />
            </button>
          </div>

          <div class="share-sheet__row">
            <button
              type="button"
              :class="['pill', 'pill--sm', format === 'square' ? 'pill--primary' : 'pill--secondary']"
              :aria-pressed="format === 'square'"
              @click="format = 'square'"
            >
              Square
            </button>
            <button
              type="button"
              :class="['pill', 'pill--sm', format === 'story' ? 'pill--primary' : 'pill--secondary']"
              :aria-pressed="format === 'story'"
              @click="format = 'story'"
            >
              Story
            </button>
            <span class="share-sheet__spacer" />
            <button
              type="button"
              class="pill pill--sm pill--secondary"
              :aria-label="`Switch to ${otherTheme.toLowerCase()} card`"
              @click="theme = theme === 'light' ? 'dark' : 'light'"
            >
              {{ otherTheme }}
            </button>
          </div>

          <div class="share-sheet__preview" :class="{ 'share-sheet__preview--story': format === 'story' }">
            <canvas ref="canvasRef" class="share-sheet__canvas" :aria-label="`Share card for ${woman.name}`" />
            <div v-if="rendering" class="share-sheet__loading" aria-live="polite">
              <LucideLoader2 :size="28" class="pill__spin" />
              <span class="share-sheet__loading-text">Drawing her card…</span>
            </div>
          </div>

          <p v-if="error" class="share-sheet__error" role="alert">
            {{ error }}
          </p>

          <div class="share-sheet__actions">
            <button type="button" class="pill pill--lg pill--secondary" :disabled="rendering" @click="handleDownload">
              Download
            </button>
            <button type="button" class="pill pill--lg pill--primary" :disabled="rendering" @click="handleShare">
              <LucideShare2 :size="16" />
              Share
            </button>
          </div>

          <button type="button" class="pill pill--ghost share-sheet__copy" @click="copyLink">
            {{ copied ? 'Copied' : 'Copy link' }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Woman } from '~/utils/types/content'
import { useDark } from '@vueuse/core'

const props = defineProps<{
  open: boolean
  woman: Woman
}>()

const emit = defineEmits<{
  close: []
}>()

const isDark = useDark({ initialValue: 'light' })
const canvasRef = ref<HTMLCanvasElement | null>(null)
const format = ref<CardFormat>('square')
const theme = ref<CardTheme>('light')
const copied = ref(false)

const { rendering, error, render, download, share } = useShareCard()
const { track } = useTag()

let lastBlob: Blob | null = null
let copiedTimer: ReturnType<typeof setTimeout> | null = null
let previousBodyOverflow = ''

const otherTheme = computed(() => (theme.value === 'light' ? 'Dark' : 'Light'))

const slug = computed(
  () => props.woman.slug || props.woman.name.toLowerCase().replace(/\s+/g, '-'),
)

const cardData = computed(() => ({
  name: props.woman.name,
  slug: slug.value,
  country: props.woman.country,
  era: props.woman.era,
  summary: props.woman.summary,
  born: props.woman.born,
  died: props.woman.died,
  imageUrl: props.woman.image,
  focal: props.woman.ogFocal,
}))

async function renderCard() {
  if (!canvasRef.value || !props.open) return
  lastBlob = await render(canvasRef.value, cardData.value, format.value, theme.value)
}

async function handleDownload() {
  if (!lastBlob) return
  await download(lastBlob, `herstory-${slug.value}`)
  track('share_card', { slug: slug.value, format: format.value, theme: theme.value, action: 'download' })
}

async function handleShare() {
  if (!lastBlob) return
  await share(lastBlob, `herstory-${slug.value}`, slug.value)
  track('share_card', { slug: slug.value, format: format.value, theme: theme.value, action: 'share' })
}

async function copyLink() {
  const url = `${window.location.origin}/women/${slug.value}`
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  catch {
    error.value = 'Could not copy the link'
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

function lockScroll() {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)
}

function unlockScroll() {
  document.body.style.overflow = previousBodyOverflow
  window.removeEventListener('keydown', onKeydown)
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    theme.value = isDark.value ? 'dark' : 'light'
    lockScroll()
    nextTick(renderCard)
  }
  else {
    unlockScroll()
  }
})

watch([format, theme], () => {
  if (props.open) {
    nextTick(renderCard)
  }
})

onBeforeUnmount(() => {
  if (props.open) unlockScroll()
  if (copiedTimer) clearTimeout(copiedTimer)
})
</script>

<style scoped>
.share-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-right: -12px;
}

.share-sheet__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.share-sheet__spacer {
  flex: 1;
}

.share-sheet__preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-muted);
}

.share-sheet__preview--story {
  aspect-ratio: 9 / 16;
  width: auto;
  height: 60vh;
  max-height: 60vh;
  align-self: center;
}

.share-sheet__canvas {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.share-sheet__loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--overlay-default);
  color: var(--text-on-primary);
}

.share-sheet__loading-text {
  font-size: 13px;
}

.share-sheet__error {
  margin: 0;
  font-size: 13px;
  color: var(--color-crimson, #e03232);
}

.share-sheet__actions {
  display: flex;
  gap: 8px;
}

.share-sheet__actions .pill {
  flex: 1;
}

.share-sheet__copy {
  align-self: center;
  height: 44px;
}
</style>
