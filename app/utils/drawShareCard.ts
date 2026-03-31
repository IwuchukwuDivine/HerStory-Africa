export type CardFormat = 'square' | 'story'
export type CardTheme = 'light' | 'dark'

export interface CardData {
  name: string
  country: string
  era: string
  summary: string
  born: number
  died: number | null
  imageUrl: string
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
  badgeBg: string
  badgeText: string
}> = {
  light: {
    bg: '#fdf8f3',
    bgGradientEnd: '#f0e6d8',
    text: '#1c0f07',
    textSecondary: '#4a2e1a',
    accent: '#b5451b',
    accentSecondary: '#c8941a',
    pattern: '#b5451b',
    badgeBg: 'rgba(181, 69, 27, 0.12)',
    badgeText: '#b5451b',
  },
  dark: {
    bg: '#120a04',
    bgGradientEnd: '#1e1108',
    text: '#f5ede4',
    textSecondary: '#d4b89a',
    accent: '#e06b3f',
    accentSecondary: '#c8941a',
    pattern: '#e06b3f',
    badgeBg: 'rgba(224, 107, 63, 0.15)',
    badgeText: '#e06b3f',
  },
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
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

function drawGeometricBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.15

  const spacing = 60
  const margin = 30

  // Diamond pattern along edges
  for (let x = margin; x < width - margin; x += spacing) {
    drawDiamond(ctx, x, margin, 8)
    drawDiamond(ctx, x, height - margin, 8)
  }
  for (let y = margin; y < height - margin; y += spacing) {
    drawDiamond(ctx, margin, y, 8)
    drawDiamond(ctx, width - margin, y, 8)
  }

  // Inner border line
  ctx.globalAlpha = 0.1
  ctx.lineWidth = 1.5
  drawRoundedRect(ctx, 50, 50, width - 100, height - 100, 12)
  ctx.stroke()

  ctx.restore()
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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
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
        // Truncate last line with ellipsis
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

export async function drawShareCard(
  canvas: HTMLCanvasElement,
  data: CardData,
  format: CardFormat = 'square',
  theme: CardTheme = 'light',
): Promise<void> {
  const { width, height } = DIMENSIONS[format]
  const colors = THEMES[theme]

  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')!

  // 1. Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, colors.bg)
  gradient.addColorStop(1, colors.bgGradientEnd)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // 2. Geometric border pattern
  drawGeometricBorder(ctx, width, height, colors.pattern)

  // 3. Photo — circular mask
  const isStory = format === 'story'
  const photoSize = isStory ? 380 : 320
  const photoCenterX = width / 2
  const photoCenterY = isStory ? 420 : 320

  try {
    const photo = await loadImage(data.imageUrl)
    ctx.save()
    ctx.beginPath()
    ctx.arc(photoCenterX, photoCenterY, photoSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    // Draw photo centered and covering the circle
    const aspect = photo.width / photo.height
    let drawW: number, drawH: number, drawX: number, drawY: number
    if (aspect > 1) {
      drawH = photoSize
      drawW = photoSize * aspect
      drawX = photoCenterX - drawW / 2
      drawY = photoCenterY - photoSize / 2
    }
    else {
      drawW = photoSize
      drawH = photoSize / aspect
      drawX = photoCenterX - photoSize / 2
      drawY = photoCenterY - drawH / 2
    }
    ctx.drawImage(photo, drawX, drawY, drawW, drawH)
    ctx.restore()

    // Photo ring
    ctx.beginPath()
    ctx.arc(photoCenterX, photoCenterY, photoSize / 2 + 3, 0, Math.PI * 2)
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 4
    ctx.globalAlpha = 0.4
    ctx.stroke()
    ctx.globalAlpha = 1
  }
  catch {
    // If image fails, draw a placeholder circle
    ctx.beginPath()
    ctx.arc(photoCenterX, photoCenterY, photoSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = colors.badgeBg
    ctx.fill()
  }

  // 4. Name
  const nameY = photoCenterY + photoSize / 2 + (isStory ? 70 : 60)
  ctx.textAlign = 'center'
  ctx.fillStyle = colors.text
  ctx.font = `bold ${isStory ? 64 : 56}px "Playfair Display", Georgia, serif`
  ctx.fillText(data.name, width / 2, nameY, width - 160)

  // 5. Country + era badge
  const badgeFontSize = isStory ? 30 : 26
  const badgePadH = 32
  const badgePadV = 18
  const badgeH = badgeFontSize + badgePadV * 2
  const badgeTopY = nameY + (isStory ? 40 : 32)

  const lifespan = `${data.born}${data.died ? `–${data.died}` : '–present'}`
  const badgeText = `${data.country}  ·  ${data.era} era  ·  ${lifespan}`

  ctx.font = `500 ${badgeFontSize}px "Inter", "Segoe UI", sans-serif`
  const badgeMetrics = ctx.measureText(badgeText)
  const badgeW = badgeMetrics.width + badgePadH * 2

  drawRoundedRect(ctx, (width - badgeW) / 2, badgeTopY, badgeW, badgeH, badgeH / 2)
  ctx.fillStyle = colors.badgeBg
  ctx.fill()

  const badgeTextY = badgeTopY + badgePadV + badgeFontSize * 0.78
  ctx.fillStyle = colors.badgeText
  ctx.fillText(badgeText, width / 2, badgeTextY)

  // 6. Summary text (wrapped)
  const summaryY = badgeTopY + badgeH + (isStory ? 50 : 40)
  const summaryFontSize = isStory ? 32 : 28
  const summaryMaxWidth = width - 180
  const maxSummaryLines = isStory ? 6 : 4

  ctx.font = `italic ${summaryFontSize}px "Playfair Display", Georgia, serif`
  ctx.fillStyle = colors.textSecondary
  const summaryLines = wrapText(ctx, `"${data.summary}"`, summaryMaxWidth, maxSummaryLines)

  const lineHeight = summaryFontSize * 1.55
  summaryLines.forEach((line, i) => {
    ctx.fillText(line, width / 2, summaryY + i * lineHeight)
  })

  // 7. Decorative accent line
  const lineY = summaryY + summaryLines.length * lineHeight + (isStory ? 40 : 30)
  const lineW = 60
  ctx.beginPath()
  ctx.moveTo(width / 2 - lineW, lineY)
  ctx.lineTo(width / 2 + lineW, lineY)
  ctx.strokeStyle = colors.accentSecondary
  ctx.lineWidth = 2.5
  ctx.globalAlpha = 0.5
  ctx.stroke()
  ctx.globalAlpha = 1

  // 8. HerStory Africa watermark
  const watermarkY = isStory ? height - 120 : height - 80
  ctx.font = `bold ${isStory ? 28 : 24}px "Playfair Display", Georgia, serif`
  ctx.fillStyle = colors.accent
  ctx.globalAlpha = 0.7
  ctx.fillText('HerStory Africa', width / 2, watermarkY)

  ctx.font = `${isStory ? 20 : 18}px "Inter", "Segoe UI", sans-serif`
  ctx.fillStyle = colors.textSecondary
  ctx.globalAlpha = 0.5
  ctx.fillText('her-story-africa-seven.vercel.app', width / 2, watermarkY + (isStory ? 36 : 30))
  ctx.globalAlpha = 1
}
