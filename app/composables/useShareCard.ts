import type { CardData, CardFormat, CardTheme } from '~/utils/drawShareCard'
import { drawShareCard } from '~/utils/drawShareCard'

export function useShareCard() {
  const rendering = ref(false)
  const error = ref<string | null>(null)
  const previewUrl = ref<string | null>(null)

  let currentObjectUrl: string | null = null

  function cleanup() {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl)
      currentObjectUrl = null
    }
    previewUrl.value = null
  }

  async function render(
    canvas: HTMLCanvasElement,
    data: CardData,
    format: CardFormat,
    theme: CardTheme,
  ): Promise<Blob | null> {
    rendering.value = true
    error.value = null
    cleanup()

    try {
      await drawShareCard(canvas, data, format, theme)

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(blob => resolve(blob), 'image/png')
      })

      if (blob) {
        currentObjectUrl = URL.createObjectURL(blob)
        previewUrl.value = currentObjectUrl
      }

      return blob
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to render card'
      return null
    }
    finally {
      rendering.value = false
    }
  }

  async function download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function share(blob: Blob, name: string, slug?: string) {
    const file = new File([blob], `${name}.png`, { type: 'image/png' })
    const profileUrl = slug ? `${window.location.origin}/women/${slug}` : undefined

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: `${name} — HerStory Africa`,
        text: 'Read her story on HerStory Africa — the women history forgot to teach you.',
        url: profileUrl,
        files: [file],
      })
      return true
    }

    // Fallback: download instead
    download(blob, name)
    return false
  }

  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    rendering,
    error,
    previewUrl,
    render,
    download,
    share,
    cleanup,
  }
}
