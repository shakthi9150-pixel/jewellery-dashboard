// Draws a shareable rate-card image onto a canvas using a given color theme.
// data = { businessName, address, phone, date, gold22k, gold24k, silver, logoUrl }

const W = 1080
const H = 1180

// Jewellery motifs are always rendered in gold, regardless of card theme —
// this is what makes them read as "jewellery" rather than an abstract icon.
const JEWEL_GOLD = '#D4AF37'
const JEWEL_GOLD_LIGHT = '#F6DA8E'

function loadImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

function formatMoney(n) {
  return '₹' + Number(n).toLocaleString('en-IN')
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Simple original vector gem/diamond icon (not a photo — an illustrated shape)
function drawGem(ctx, cx, cy, size, color) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(size * 0.7, -size * 0.3)
  ctx.lineTo(size * 0.45, size)
  ctx.lineTo(-size * 0.45, size)
  ctx.lineTo(-size * 0.7, -size * 0.3)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(size * 0.7, -size * 0.3)
  ctx.lineTo(0, size * 0.1)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

// Simple 4-point sparkle/star, original illustration
function drawSparkle(ctx, cx, cy, size, color) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.quadraticCurveTo(size * 0.15, -size * 0.15, size, 0)
  ctx.quadraticCurveTo(size * 0.15, size * 0.15, 0, size)
  ctx.quadraticCurveTo(-size * 0.15, size * 0.15, -size, 0)
  ctx.quadraticCurveTo(-size * 0.15, -size * 0.15, 0, -size)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawGemDivider(ctx, x1, x2, y, color) {
  ctx.strokeStyle = color
  ctx.globalAlpha = 0.6
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x1, y)
  ctx.lineTo(x2, y)
  ctx.stroke()
  ctx.globalAlpha = 1
  drawGem(ctx, (x1 + x2) / 2, y, 10, color)
}

function drawFramedPhoto(ctx, img, cx, cy, size) {
  const r = size / 2
  // soft shadow
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 8
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = '#000'
  ctx.fill()
  ctx.restore()

  // clipped photo, cover-fit into circle
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  const scale = Math.max(size / img.width, size / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh)
  ctx.restore()

  // double gold ring frame
  ctx.strokeStyle = JEWEL_GOLD
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = JEWEL_GOLD_LIGHT
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(cx, cy, r - 12, 0, Math.PI * 2)
  ctx.stroke()
}

// ---- Original vector jewellery motifs (illustrated line art, not photos) ----
// Always rendered in gold tones, independent of the card's color theme.

function drawNecklaceMotif(ctx, cx, cy, scale) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.strokeStyle = JEWEL_GOLD
  ctx.lineWidth = 3.5
  // chain curve
  ctx.beginPath()
  ctx.moveTo(-70, -20)
  ctx.quadraticCurveTo(0, 55, 70, -20)
  ctx.stroke()
  // small chain links
  const linkCount = 13
  for (let i = 0; i <= linkCount; i++) {
    const t = i / linkCount
    const x = -70 + t * 140
    const yy = -20 + Math.sin(t * Math.PI) * 75
    ctx.beginPath()
    ctx.arc(x, yy, 2.6, 0, Math.PI * 2)
    ctx.fillStyle = JEWEL_GOLD_LIGHT
    ctx.fill()
  }
  // pendant — a larger gem with a highlight facet for shine
  drawGem(ctx, 0, 62, 30, JEWEL_GOLD)
  drawGem(ctx, 0, 62, 14, JEWEL_GOLD_LIGHT)
  ctx.restore()
}

function drawRingMotif(ctx, cx, cy, scale) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.strokeStyle = JEWEL_GOLD
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(0, 25, 46, 0.32 * Math.PI, 1.68 * Math.PI)
  ctx.stroke()
  ctx.strokeStyle = JEWEL_GOLD_LIGHT
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 25, 46, 0.32 * Math.PI, 1.68 * Math.PI)
  ctx.stroke()
  drawGem(ctx, 0, -22, 26, JEWEL_GOLD)
  drawGem(ctx, 0, -22, 12, JEWEL_GOLD_LIGHT)
  ctx.restore()
}

function drawBangleMotif(ctx, cx, cy, scale) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.strokeStyle = JEWEL_GOLD
  ctx.lineWidth = 13
  ctx.beginPath()
  ctx.ellipse(0, 0, 68, 55, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = JEWEL_GOLD_LIGHT
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.8
  ctx.beginPath()
  ctx.ellipse(0, 0, 68, 55, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function drawEarringMotif(ctx, cx, cy, scale) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.strokeStyle = JEWEL_GOLD
  ctx.lineWidth = 3
  // hook
  ctx.beginPath()
  ctx.arc(0, -40, 12, 0.2 * Math.PI, 1.8 * Math.PI)
  ctx.stroke()
  // chain link
  ctx.beginPath()
  ctx.moveTo(0, -28)
  ctx.lineTo(0, -4)
  ctx.stroke()
  // drop gem
  drawGem(ctx, 0, 26, 28, JEWEL_GOLD)
  drawGem(ctx, 0, 26, 13, JEWEL_GOLD_LIGHT)
  ctx.restore()
}

export const JEWELLERY_MOTIFS = {
  none: null,
  necklace: drawNecklaceMotif,
  ring: drawRingMotif,
  bangle: drawBangleMotif,
  earring: drawEarringMotif,
}

export async function drawRateCard(ctx, data, theme, motifKey = 'none', photoUrl = null) {
  ctx.clearRect(0, 0, W, H)

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, theme.bg[0])
  grad.addColorStop(1, theme.bg[1])
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Outer + inner gold/silver border frame
  ctx.strokeStyle = theme.border
  ctx.lineWidth = 6
  drawRoundedRect(ctx, 28, 28, W - 56, H - 56, 20)
  ctx.stroke()
  ctx.lineWidth = 1.5
  drawRoundedRect(ctx, 42, 42, W - 84, H - 84, 14)
  ctx.stroke()

  // Corner sparkle decorations (original vector illustrations)
  drawSparkle(ctx, 90, 90, 16, theme.accent)
  drawSparkle(ctx, W - 90, 90, 16, theme.accent)
  drawSparkle(ctx, 90, H - 90, 16, theme.accent)
  drawSparkle(ctx, W - 90, H - 90, 16, theme.accent)

  const hasPanel = !!theme.panel
  let y = 130

  // Logo
  const logo = await loadImage(data.logoUrl)
  if (logo) {
    const size = 108
    ctx.save()
    ctx.beginPath()
    ctx.arc(W / 2, y, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(logo, W / 2 - size / 2, y - size / 2, size, size)
    ctx.restore()
    ctx.strokeStyle = theme.border
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(W / 2, y, size / 2, 0, Math.PI * 2)
    ctx.stroke()
    y += 85
  } else {
    // decorative gem cluster in place of logo
    drawGem(ctx, W / 2 - 36, y, 20, theme.accent)
    drawGem(ctx, W / 2, y - 8, 26, theme.border)
    drawGem(ctx, W / 2 + 36, y, 20, theme.accent)
    y += 75
  }

  // Business name
  ctx.textAlign = 'center'
  ctx.fillStyle = theme.textPrimary
  ctx.font = '700 52px Georgia, serif'
  ctx.fillText(data.businessName, W / 2, y)
  y += 46

  ctx.font = '23px Georgia, serif'
  ctx.fillStyle = theme.accent
  ctx.fillText('Gold & Silver Rate', W / 2, y)
  y += 36

  ctx.font = '20px Arial'
  ctx.fillStyle = theme.textSecondary
  ctx.fillText(`as on ${data.date}`, W / 2, y)
  y += 60

  const motifFn = JEWELLERY_MOTIFS[motifKey]
  const photoImg = await loadImage(photoUrl)
  if (photoImg) {
    drawFramedPhoto(ctx, photoImg, W / 2, y + 130, 320)
    y += 290
  } else if (motifFn) {
    motifFn(ctx, W / 2, y + 90, 2.0)
    y += 210
  } else {
    y += 20
  }

  drawGemDivider(ctx, 130, W - 130, y, theme.border)
  y += 70

  const rows = []
  if (data.gold22k) rows.push(['22K Gold (1g)', formatMoney(data.gold22k)])
  if (data.gold24k) rows.push(['24K Gold (1g)', formatMoney(data.gold24k)])
  if (data.silver) rows.push(['Silver (1g)', formatMoney(data.silver)])

  if (hasPanel) {
    // Light inner panel for rows (maroon-gold style layouts)
    const panelTop = y - 45
    const panelHeight = rows.length * 92 + 20
    ctx.fillStyle = theme.panel
    drawRoundedRect(ctx, 90, panelTop, W - 180, panelHeight, 16)
    ctx.fill()

    rows.forEach(([label, value], i) => {
      const rowY = y + i * 92 + 20
      if (i % 2 === 1) {
        ctx.fillStyle = theme.panelAlt
        ctx.fillRect(110, rowY - 42, W - 220, 76)
      }
      ctx.textAlign = 'left'
      ctx.font = '600 32px Arial'
      ctx.fillStyle = theme.panelText
      ctx.fillText(label, 140, rowY + 8)
      ctx.textAlign = 'right'
      ctx.font = '700 38px Georgia, serif'
      ctx.fillStyle = theme.bg[0]
      ctx.fillText(value, W - 140, rowY + 8)
    })
    y = panelTop + panelHeight + 40
  } else {
    // Direct-on-background rows (dark themes)
    rows.forEach(([label, value]) => {
      ctx.font = '600 34px Arial'
      ctx.fillStyle = theme.textPrimary
      ctx.textAlign = 'left'
      ctx.fillText(label, 130, y)
      ctx.textAlign = 'right'
      ctx.fillStyle = theme.accent
      ctx.font = '700 40px Georgia, serif'
      ctx.fillText(value, W - 130, y)
      y += 80
    })
    y += 10
  }

  // Footer — follows content directly (capped so it doesn't sit too high on short cards)
  let fy = Math.max(y + 75, H - 170)
  drawGemDivider(ctx, 130, W - 130, fy - 45, theme.border)
  ctx.textAlign = 'center'
  ctx.font = '22px Arial'
  ctx.fillStyle = theme.textSecondary
  if (data.phone) ctx.fillText(`📞 ${data.phone}`, W / 2, fy)
  fy += 32
  if (data.address) {
    ctx.font = '18px Arial'
    ctx.fillText(data.address, W / 2, fy)
  }
}

export const CANVAS_WIDTH = W
export const CANVAS_HEIGHT = H
