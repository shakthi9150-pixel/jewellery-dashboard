// Draws a shareable rate-card image onto a canvas. Two template styles.
// data = { businessName, address, phone, date, gold22k, gold24k, silver, logoImg }

const W = 1080
const H = 1350

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

export async function drawDarkTemplate(ctx, data) {
  ctx.clearRect(0, 0, W, H)

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#1a1410')
  grad.addColorStop(1, '#2b2016')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Gold border frame
  ctx.strokeStyle = '#C9A227'
  ctx.lineWidth = 6
  drawRoundedRect(ctx, 30, 30, W - 60, H - 60, 20)
  ctx.stroke()
  ctx.lineWidth = 1.5
  drawRoundedRect(ctx, 44, 44, W - 88, H - 88, 14)
  ctx.stroke()

  let y = 130

  // Logo
  const logo = await loadImage(data.logoUrl)
  if (logo) {
    const size = 110
    ctx.save()
    ctx.beginPath()
    ctx.arc(W / 2, y, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(logo, W / 2 - size / 2, y - size / 2, size, size)
    ctx.restore()
    ctx.strokeStyle = '#C9A227'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(W / 2, y, size / 2, 0, Math.PI * 2)
    ctx.stroke()
    y += 90
  }

  // Business name
  ctx.textAlign = 'center'
  ctx.fillStyle = '#F5E6B8'
  ctx.font = '700 54px Georgia, serif'
  ctx.fillText(data.businessName, W / 2, y)
  y += 50

  ctx.font = '24px Georgia, serif'
  ctx.fillStyle = '#C9A227'
  ctx.fillText('Gold & Silver Rate', W / 2, y)
  y += 40

  ctx.font = '22px Arial'
  ctx.fillStyle = '#cbbfa8'
  ctx.fillText(`as on ${data.date}`, W / 2, y)
  y += 70

  ctx.strokeStyle = '#C9A227'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(120, y)
  ctx.lineTo(W - 120, y)
  ctx.stroke()
  y += 70

  const rows = []
  if (data.gold22k) rows.push(['22K Gold (1g)', formatMoney(data.gold22k)])
  if (data.gold24k) rows.push(['24K Gold (1g)', formatMoney(data.gold24k)])
  if (data.silver) rows.push(['Silver (1g)', formatMoney(data.silver)])

  rows.forEach(([label, value]) => {
    ctx.font = '600 34px Arial'
    ctx.fillStyle = '#e8ddc4'
    ctx.textAlign = 'left'
    ctx.fillText(label, 130, y)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#F5CB5C'
    ctx.font = '700 40px Georgia, serif'
    ctx.fillText(value, W - 130, y)
    y += 80
  })

  // Footer
  y = H - 140
  ctx.strokeStyle = '#C9A227'
  ctx.beginPath()
  ctx.moveTo(120, y)
  ctx.lineTo(W - 120, y)
  ctx.stroke()
  y += 45
  ctx.textAlign = 'center'
  ctx.font = '22px Arial'
  ctx.fillStyle = '#cbbfa8'
  if (data.phone) ctx.fillText(`📞 ${data.phone}`, W / 2, y)
  y += 34
  if (data.address) {
    ctx.font = '18px Arial'
    ctx.fillText(data.address, W / 2, y)
  }
}

export async function drawMaroonTemplate(ctx, data) {
  ctx.clearRect(0, 0, W, H)

  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#6B1E2B')
  grad.addColorStop(1, '#4A1420')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = '#E0C15C'
  ctx.lineWidth = 8
  drawRoundedRect(ctx, 24, 24, W - 48, H - 48, 24)
  ctx.stroke()

  // Cream inner card
  ctx.fillStyle = '#FAF6EE'
  drawRoundedRect(ctx, 60, 200, W - 120, H - 340, 16)
  ctx.fill()

  let y = 140

  const logo = await loadImage(data.logoUrl)
  if (logo) {
    const size = 100
    ctx.save()
    ctx.beginPath()
    ctx.arc(W / 2, y, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(logo, W / 2 - size / 2, y - size / 2, size, size)
    ctx.restore()
    ctx.strokeStyle = '#E0C15C'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(W / 2, y, size / 2, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = '#F5E6B8'
  ctx.font = '700 44px Georgia, serif'
  ctx.fillText(data.businessName, W / 2, 250)

  y = 320
  ctx.font = '600 30px Georgia, serif'
  ctx.fillStyle = '#6B1E2B'
  ctx.fillText("Today's Rate", W / 2, y)
  y += 36
  ctx.font = '20px Arial'
  ctx.fillStyle = '#8a5a5a'
  ctx.fillText(data.date, W / 2, y)
  y += 60

  const rows = []
  if (data.gold22k) rows.push(['22K Gold (1g)', formatMoney(data.gold22k)])
  if (data.gold24k) rows.push(['24K Gold (1g)', formatMoney(data.gold24k)])
  if (data.silver) rows.push(['Silver (1g)', formatMoney(data.silver)])

  rows.forEach(([label, value], i) => {
    const rowY = y + i * 100
    ctx.fillStyle = i % 2 === 0 ? '#F3EAD3' : '#FAF6EE'
    ctx.fillRect(100, rowY - 45, W - 200, 80)
    ctx.textAlign = 'left'
    ctx.font = '600 32px Arial'
    ctx.fillStyle = '#4A1420'
    ctx.fillText(label, 130, rowY + 8)
    ctx.textAlign = 'right'
    ctx.font = '700 38px Georgia, serif'
    ctx.fillStyle = '#6B1E2B'
    ctx.fillText(value, W - 130, rowY + 8)
  })

  // Footer on maroon area below card
  let fy = H - 130
  ctx.textAlign = 'center'
  ctx.font = '22px Arial'
  ctx.fillStyle = '#F5E6B8'
  if (data.phone) ctx.fillText(`📞 ${data.phone}`, W / 2, fy)
  fy += 32
  if (data.address) {
    ctx.font = '18px Arial'
    ctx.fillStyle = '#e8d5c4'
    ctx.fillText(data.address, W / 2, fy)
  }
}

export const CANVAS_WIDTH = W
export const CANVAS_HEIGHT = H
