import type { Stage } from '../data/stages'
import { computeFlowLayout, controlColor, chipTextColor, FLOW_WIDTH, type FlowLayout, type NodeRect } from './layout'
import { BRAND, SITE } from '../core/brand'
import { LOGO_SRC, PRODUCT } from '../core/assets'
import { log } from '../core/log'

const FONT_DISPLAY = '"Space Grotesk", "Segoe UI", system-ui, sans-serif'
const FONT_BODY = '"Inter", "Segoe UI", system-ui, sans-serif'
const BAND_H = 96
const FLOW_PAD = 60

let cachedLogo: HTMLImageElement | null = null
let pendingLogo: Promise<HTMLImageElement | null> | null = null
let cachedProduct: HTMLImageElement | null = null
let pendingProduct: Promise<HTMLImageElement | null> | null = null

export function loadLogo(): Promise<HTMLImageElement | null> {
  if (typeof window === 'undefined' || typeof Image === 'undefined') return Promise.resolve(null)
  if (cachedLogo) return Promise.resolve(cachedLogo)
  if (!pendingLogo) {
    pendingLogo = new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        cachedLogo = img
        resolve(img)
      }
      img.onerror = () => {
        log.warn('logo:load failed')
        resolve(null)
      }
      img.src = LOGO_SRC
    })
  }
  return pendingLogo
}

export function loadProductImage(): Promise<HTMLImageElement | null> {
  if (typeof window === 'undefined' || typeof Image === 'undefined') return Promise.resolve(null)
  if (cachedProduct) return Promise.resolve(cachedProduct)
  if (!pendingProduct) {
    pendingProduct = new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        cachedProduct = img
        resolve(img)
      }
      img.onerror = () => {
        log.warn('product:load failed')
        resolve(null)
      }
      img.src = PRODUCT.single
    })
  }
  return pendingProduct
}

export async function loadLogoDataUrl(): Promise<string | undefined> {
  const img = await loadLogo()
  if (!img || typeof document === 'undefined') return undefined
  const c = document.createElement('canvas')
  c.width = 256
  c.height = Math.max(1, Math.round(256 * (img.naturalHeight / Math.max(1, img.naturalWidth))))
  const x = c.getContext('2d')
  if (!x) return undefined
  x.drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/png')
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('canvas toBlob failed'))), type, quality)
  })
}

async function fontsReady(): Promise<void> {
  try {
    await (document as Document & { fonts?: FontFaceSet }).fonts?.ready
  } catch {
    /* font readiness is best-effort */
  }
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = []
  let remaining = text
  for (let i = 0; i < maxLines; i++) {
    if (!remaining) break
    const isLast = i === maxLines - 1
    if (ctx.measureText(remaining).width <= maxWidth) {
      lines.push(remaining)
      break
    }
    let lo = 0
    let hi = remaining.length
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (ctx.measureText(remaining.slice(0, mid)).width <= maxWidth) lo = mid
      else hi = mid - 1
    }
    if (isLast) {
      let n = lo
      while (n > 0 && ctx.measureText(`${remaining.slice(0, n)}…`).width > maxWidth) n--
      lines.push(`${remaining.slice(0, n).replace(/\s+$/, '')}…`)
      break
    }
    const cut = remaining.lastIndexOf(' ', lo)
    const idx = cut > 0 ? cut : lo
    lines.push(remaining.slice(0, idx).trim())
    remaining = remaining.slice(idx).trim()
  }
  return lines
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function lineArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  const head = 22
  const ang = Math.atan2(y2 - y1, x2 - x1)
  ctx.strokeStyle = 'rgba(220,8,22,0.55)'
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2 - head * Math.cos(ang), y2 - head * Math.sin(ang))
  ctx.stroke()
  ctx.fillStyle = BRAND.red
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - head * Math.cos(ang - 0.45), y2 - head * Math.sin(ang - 0.45))
  ctx.lineTo(x2 - head * Math.cos(ang + 0.45), y2 - head * Math.sin(ang + 0.45))
  ctx.closePath()
  ctx.fill()
}

function drawPill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string): void {
  ctx.save()
  ctx.shadowColor = 'rgba(220,8,22,0.45)'
  ctx.shadowBlur = 18
  roundRectPath(ctx, x, y, w, h, h / 2)
  ctx.fillStyle = '#15181e'
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = BRAND.red
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.fillStyle = BRAND.red
  ctx.font = `700 ${h * 0.5}px ${FONT_DISPLAY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x + w / 2, y + h / 2 + 1)
  ctx.restore()
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  layout: FlowLayout,
  logo: HTMLImageElement | null,
  product: HTMLImageElement | null,
): void {
  const { width: w, headerH, nodes } = layout
  const pad = FLOW_PAD
  const logoH = 120
  let logoW = 0
  if (logo && logo.naturalWidth > 0) {
    logoW = Math.round((logoH * logo.naturalWidth) / Math.max(1, logo.naturalHeight))
    ctx.drawImage(logo, pad, 34, logoW, logoH)
  } else {
    logoW = 120
    roundRectPath(ctx, pad, 34, 120, 120, 22)
    ctx.fillStyle = BRAND.red
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `700 70px ${FONT_DISPLAY}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('C', pad + 60, 34 + 60 + 3)
  }
  const titleX = pad + logoW + 34
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = BRAND.red
  ctx.font = `700 84px ${FONT_DISPLAY}`
  ctx.fillText('WAFER JOURNEY!', titleX, 126)
  ctx.fillStyle = BRAND.text
  ctx.font = `600 40px ${FONT_DISPLAY}`
  ctx.fillText('Production & Quality Control', titleX, 184)
  ctx.fillStyle = BRAND.dim
  ctx.font = `400 26px ${FONT_BODY}`
  ctx.fillText(
    `Stage-by-stage quality control across the production line — ${nodes.length} stages · CCP / OPRP / CP`,
    titleX,
    230,
  )

  const pillW = 250
  if (product && product.naturalWidth > 0 && product.naturalHeight > 0) {
    const prodH = 152
    const prodW = Math.round((prodH * product.naturalWidth) / product.naturalHeight)
    const px = w - pad - pillW - 44 - prodW
    const py = Math.round((layout.headerH - prodH) / 2)
    const cx = px + prodW / 2
    ctx.save()
    ctx.shadowColor = 'rgba(220,8,22,0.45)'
    ctx.shadowBlur = 34
    ctx.drawImage(product, px, py, prodW, prodH)
    ctx.restore()
    ctx.fillStyle = BRAND.red
    ctx.font = `700 24px ${FONT_DISPLAY}`
    ctx.textAlign = 'center'
    ctx.fillText('FINAL PRODUCT', cx, py + prodH + 26)
  }
  roundRectPath(ctx, w - pad - pillW, 52, pillW, 56, 28)
  ctx.strokeStyle = BRAND.red
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.fillStyle = BRAND.red
  ctx.font = `700 26px ${FONT_DISPLAY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('NOT OFFICIAL', w - pad - pillW / 2, 80)
  ctx.fillStyle = BRAND.dim
  ctx.font = `500 22px ${FONT_BODY}`
  ctx.fillText('AUG round QA interns 2026', w - pad - pillW / 2, 122)

  ctx.strokeStyle = 'rgba(220,8,22,0.35)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(pad, headerH - 30)
  ctx.lineTo(w - pad, headerH - 30)
  ctx.stroke()
}

function drawNode(ctx: CanvasRenderingContext2D, node: NodeRect): void {
  const { x, y, w, h } = node
  const s = node.stage
  const pad = 28

  roundRectPath(ctx, x + 8, y + 10, w, h, 24)
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fill()

  ctx.save()
  roundRectPath(ctx, x, y, w, h, 24)
  ctx.fillStyle = BRAND.card
  ctx.fill()
  ctx.strokeStyle = BRAND.border
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.clip()

  ctx.fillStyle = BRAND.red
  ctx.fillRect(x, y, w, BAND_H)

  ctx.textBaseline = 'middle'
  const cy = y + BAND_H / 2
  ctx.beginPath()
  ctx.arc(x + 52, cy, 30, 0, Math.PI * 2)
  ctx.fillStyle = BRAND.ink
  ctx.fill()
  ctx.fillStyle = BRAND.red
  ctx.font = `700 44px ${FONT_DISPLAY}`
  ctx.textAlign = 'center'
  ctx.fillText(String(s.num), x + 52, cy + 2)
  ctx.font = `60px system-ui, sans-serif`
  ctx.textAlign = 'left'
  ctx.fillText(s.emoji, x + 98, cy + 2)
  ctx.fillStyle = '#fff'
  ctx.font = `700 50px ${FONT_DISPLAY}`
  ctx.fillText(s.title, x + 180, cy + 2)

  const chip = s.control
  const chipColor = controlColor(chip)
  ctx.font = `700 40px ${FONT_DISPLAY}`
  const chipW = ctx.measureText(chip).width + 52
  const chipH = 72
  roundRectPath(ctx, x + w - pad - chipW, y + BAND_H / 2 - chipH / 2, chipW, chipH, chipH / 2)
  ctx.fillStyle = chipColor
  ctx.fill()
  if (chip === 'CCP') {
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 5
    ctx.stroke()
  }
  ctx.fillStyle = chipTextColor(chip)
  ctx.textAlign = 'center'
  ctx.fillText(chip, x + w - pad - chipW / 2, cy + 2)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  const bodyX = x + pad
  const bodyW = w - pad * 2

  ctx.font = `600 44px ${FONT_BODY}`
  ctx.fillStyle = BRAND.text
  const proc = fitText(ctx, s.process, bodyW, 4)
  proc.forEach((line, i) => ctx.fillText(line, bodyX, y + BAND_H + 48 + i * 58))

  ctx.font = `700 30px ${FONT_BODY}`
  ctx.fillStyle = BRAND.red
  ctx.fillText('QA', bodyX, y + BAND_H + 306)
  ctx.font = `500 38px ${FONT_BODY}`
  ctx.fillStyle = BRAND.text
  const role = fitText(ctx, ` ${s.qaRole}`, bodyW - 52, 3)
  role.forEach((line, i) => ctx.fillText(line, bodyX + 48, y + BAND_H + 342 + i * 54))

  const checks = s.checks.slice(0, 2)
  checks.forEach((check, i) => {
    const lineY = y + BAND_H + 522 + i * 100
    ctx.fillStyle = BRAND.red
    ctx.font = `700 38px ${FONT_BODY}`
    ctx.fillText('✓', bodyX, lineY)
    ctx.font = `500 36px ${FONT_BODY}`
    ctx.fillStyle = BRAND.dim
    const text = fitText(ctx, ` ${check}`, bodyW - 40, 2)
    text.forEach((line, j) => ctx.fillText(line, bodyX + 38, lineY + j * 50))
  })
  ctx.restore()
}

function drawFooter(ctx: CanvasRenderingContext2D, layout: FlowLayout): void {
  const { width: w, height, footerH } = layout
  const top = height - footerH
  ctx.strokeStyle = 'rgba(220,8,22,0.35)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(FLOW_PAD, top + 44)
  ctx.lineTo(w - FLOW_PAD, top + 44)
  ctx.stroke()
  ctx.textAlign = 'center'
  ctx.fillStyle = BRAND.text
  ctx.font = `700 32px ${FONT_DISPLAY}`
  ctx.fillText('WAFER JOURNEY! — PRODUCTION & QUALITY CONTROL', w / 2, top + 88)
  ctx.fillStyle = BRAND.red
  ctx.font = `700 24px ${FONT_BODY}`
  ctx.fillText(SITE.madeBy, w / 2, top + 122)
}

function drawFlowchart(
  ctx: CanvasRenderingContext2D,
  layout: FlowLayout,
  logo: HTMLImageElement | null,
  product: HTMLImageElement | null,
): void {
  const { width: w, height: h, nodes } = layout
  ctx.fillStyle = BRAND.ink
  ctx.fillRect(0, 0, w, h)

  const glow = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, h * 0.75)
  glow.addColorStop(0, 'rgba(220,8,22,0.1)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  for (let gx = 0; gx < w; gx += 120) {
    ctx.beginPath()
    ctx.moveTo(gx, 0)
    ctx.lineTo(gx, h)
    ctx.stroke()
  }

  drawHeader(ctx, layout, logo, product)

  const first = nodes[0]
  const capH = 50
  const startW = 150
  const endW = 180
  const firstCx = first.x + first.w / 2
  drawPill(ctx, firstCx - startW / 2, first.y - capH - 16, startW, capH, 'START')
  ctx.strokeStyle = 'rgba(220,8,22,0.6)'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(firstCx, first.y - 16)
  ctx.lineTo(firstCx, first.y + 12)
  ctx.stroke()

  nodes.forEach((node, i) => {
    drawNode(ctx, node)
    const next = nodes[i + 1]
    if (!next) return
    if (node.row === next.row) {
      const movingRight = next.col > node.col
      const cy = node.y + node.h / 2
      if (movingRight) {
        lineArrow(ctx, node.x + node.w, cy, next.x - 22, cy)
      } else {
        lineArrow(ctx, node.x, cy, next.x + next.w + 22, cy)
      }
    } else {
      const cx = node.col === 0 ? node.x : node.x + node.w
      const nextCx = next.col === 0 ? next.x : next.x + next.w
      lineArrow(ctx, cx, node.y + node.h, nextCx, next.y - 22)
    }
  })

  const last = nodes[nodes.length - 1]
  const lastCx = last.x + last.w / 2
  drawPill(ctx, lastCx - endW / 2, last.y - capH - 16, endW, capH, 'FINISH')
  ctx.strokeStyle = 'rgba(220,8,22,0.6)'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(lastCx, last.y - 16)
  ctx.lineTo(lastCx, last.y + 12)
  ctx.stroke()

  drawFooter(ctx, layout)
}

export interface RenderOptions {
  width?: number
  scale?: number
}

export async function renderFlowchart(stages: Stage[], opts?: RenderOptions): Promise<HTMLCanvasElement> {
  const layout = computeFlowLayout(stages, opts?.width ?? FLOW_WIDTH)
  const scale = opts?.scale ?? 1.5
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(layout.width * scale)
  canvas.height = Math.round(layout.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.scale(scale, scale)
  await fontsReady()
  drawFlowchart(ctx, layout, await loadLogo(), await loadProductImage())
  log.debug(`renderFlowchart: ${canvas.width}x${canvas.height}`)
  return canvas
}
