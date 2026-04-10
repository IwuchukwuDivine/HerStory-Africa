export type CardFormat = 'square' | 'story'
export type CardTheme = 'light' | 'dark'

export interface ReflectionCardData {
  prompt: string
  response: string
  articleTitle: string
}

interface CardDimensions {
  width: number
  height: number
}

const DIMENSIONS: Record<CardFormat, CardDimensions> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
}

const THEMES: Record<CardTheme, {
  bg: string
  bgGradientEnd: string
  text: string
  textSecondary: string
  accent: string
  accentSecondary: string
  pattern: string
  quoteBg: string
}> = {
  light: {
    bg: '#fdf8f3',
    bgGradientEnd: '#f0e6d8',
    text: '#1c0f07',
    textSecondary: '#4a2e1a',
    accent: '#b5451b',
    accentSecondary: '#c8941a',
    pattern: '#b5451b',
    quoteBg: 'rgba(181, 69, 27, 0.06)',
  },
  dark: {
    bg: '#120a04',
    bgGradientEnd: '#1e1108',
    text: '#f5ede4',
    textSecondary: '#d4b89a',
    accent: '#e06b3f',
    accentSecondary: '#c8941a',
    pattern: '#e06b3f',
    quoteBg: 'rgba(224, 107, 63, 0.08)',
  },
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath()
  ctx.moveTo(cx, cy - size)
  ctx.lineTo(cx + size, cy)
  ctx.lineTo(cx, cy + size)
  ctx.lineTo(cx - size, cy)
  ctx.closePath()
  ctx.stroke()
}

function drawGeometricBorder(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.15

  const spacing = 60
  const margin = 30

  for (let x = margin; x < width - margin; x += spacing) {
    drawDiamond(ctx, x, margin, 8)
    drawDiamond(ctx, x, height - margin, 8)
  }
  for (let y = margin; y < height - margin; y += spacing) {
    drawDiamond(ctx, margin, y, 8)
    drawDiamond(ctx, width - margin, y, 8)
  }

  ctx.globalAlpha = 0.1
  ctx.lineWidth = 1.5
  drawRoundedRect(ctx, 50, 50, width - 100, height - 100, 12)
  ctx.stroke()

  ctx.restore()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word

      if (lines.length >= maxLines) {
        const lastLine = lines[maxLines - 1]!
        lines[maxLines - 1] = lastLine.replace(/\s+\S*$/, '') + '…'
        return lines.slice(0, maxLines)
      }
    }
    else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    if (lines.length >= maxLines) {
      lines[maxLines - 1] = lines[maxLines - 1]!.replace(/\s+\S*$/, '') + '…'
      return lines.slice(0, maxLines)
    }
    lines.push(currentLine)
  }

  return lines
}

export function drawReflectionCard(
  canvas: HTMLCanvasElement,
  data: ReflectionCardData,
  format: CardFormat = 'square',
  theme: CardTheme = 'light',
): void {
  const { width, height } = DIMENSIONS[format]
  const colors = THEMES[theme]
  const isStory = format === 'story'

  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')!
  const pad = 90
  const contentWidth = width - pad * 2

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, colors.bg)
  gradient.addColorStop(1, colors.bgGradientEnd)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  drawGeometricBorder(ctx, width, height, colors.pattern)

  // "Over to you" label
  const labelY = isStory ? 280 : 200
  ctx.textAlign = 'center'
  ctx.font = `600 ${isStory ? 26 : 22}px "Inter", "Segoe UI", sans-serif`
  ctx.fillStyle = colors.accent
  ctx.globalAlpha = 0.8
  ctx.fillText('Over to you', width / 2, labelY)
  ctx.globalAlpha = 1

  // Accent line under label
  const accentLineY = labelY + 20
  ctx.beginPath()
  ctx.moveTo(width / 2 - 30, accentLineY)
  ctx.lineTo(width / 2 + 30, accentLineY)
  ctx.strokeStyle = colors.accentSecondary
  ctx.lineWidth = 2.5
  ctx.globalAlpha = 0.5
  ctx.stroke()
  ctx.globalAlpha = 1

  // Prompt (bold, wrapped)
  const promptStartY = accentLineY + (isStory ? 60 : 50)
  const promptFontSize = isStory ? 38 : 34
  ctx.font = `bold italic ${promptFontSize}px "Playfair Display", Georgia, serif`
  ctx.fillStyle = colors.text
  ctx.textAlign = 'center'

  const promptLines = wrapText(ctx, `"${data.prompt}"`, contentWidth, isStory ? 5 : 4)
  const promptLineHeight = promptFontSize * 1.5
  promptLines.forEach((line, i) => {
    ctx.fillText(line, width / 2, promptStartY + i * promptLineHeight)
  })

  // Quote background box for response
  const responseStartY = promptStartY + promptLines.length * promptLineHeight + (isStory ? 60 : 40)
  const responseFontSize = isStory ? 34 : 30
  ctx.font = `${responseFontSize}px "Playfair Display", Georgia, serif`

  const responseLines = wrapText(ctx, data.response, contentWidth - 60, isStory ? 8 : 5)
  const responseLineHeight = responseFontSize * 1.6
  const responseBlockHeight = responseLines.length * responseLineHeight + 50
  const boxPad = 30

  // Draw quote background
  drawRoundedRect(ctx, pad, responseStartY - boxPad, contentWidth, responseBlockHeight + boxPad, 16)
  ctx.fillStyle = colors.quoteBg
  ctx.fill()

  // Accent bar on left of quote box
  const barX = pad
  const barY = responseStartY - boxPad
  drawRoundedRect(ctx, barX, barY, 5, responseBlockHeight + boxPad, 3)
  ctx.fillStyle = colors.accent
  ctx.globalAlpha = 0.6
  ctx.fill()
  ctx.globalAlpha = 1

  // Response text
  ctx.font = `${responseFontSize}px "Playfair Display", Georgia, serif`
  ctx.fillStyle = colors.textSecondary
  ctx.textAlign = 'center'
  responseLines.forEach((line, i) => {
    ctx.fillText(line, width / 2, responseStartY + 20 + i * responseLineHeight)
  })

  // Article title reference
  const refY = responseStartY + responseBlockHeight + (isStory ? 60 : 40)
  const refFontSize = isStory ? 22 : 20
  ctx.font = `italic ${refFontSize}px "Inter", "Segoe UI", sans-serif`
  ctx.fillStyle = colors.textSecondary
  ctx.globalAlpha = 0.6
  ctx.textAlign = 'center'
  const titleLines = wrapText(ctx, `Inspired by: ${data.articleTitle}`, contentWidth, 2)
  titleLines.forEach((line, i) => {
    ctx.fillText(line, width / 2, refY + i * (refFontSize * 1.4))
  })
  ctx.globalAlpha = 1

  // HerStory Africa watermark
  const watermarkY = isStory ? height - 120 : height - 80
  ctx.font = `bold ${isStory ? 28 : 24}px "Playfair Display", Georgia, serif`
  ctx.fillStyle = colors.accent
  ctx.globalAlpha = 0.7
  ctx.fillText('HerStory Africa', width / 2, watermarkY)

  ctx.font = `${isStory ? 20 : 18}px "Inter", "Segoe UI", sans-serif`
  ctx.fillStyle = colors.textSecondary
  ctx.globalAlpha = 0.5
  ctx.fillText('herstoryafrica.com.ng', width / 2, watermarkY + (isStory ? 36 : 30))
  ctx.globalAlpha = 1
}
