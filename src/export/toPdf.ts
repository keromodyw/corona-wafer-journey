import type { jsPDF } from 'jspdf'
import type { Stage, ControlType } from '../data/stages'
import { CONTROL_LABEL } from '../data/stages'
import { SITE } from '../core/brand'

const W = 297
const H = 210
const M = 16

const C = {
  red: [220, 8, 22],
  pink: [255, 159, 170],
  orange: [249, 125, 65],
  rose: [216, 96, 106],
  peach: [255, 221, 194],
  ink: [14, 14, 14],
  ink2: [24, 24, 24],
  card: [30, 30, 30],
  text: [244, 242, 234],
  dim: [168, 162, 154],
} as const

function setFill(doc: jsPDF, c: readonly number[]): void {
  doc.setFillColor(c[0], c[1], c[2])
}

function setText(doc: jsPDF, c: readonly number[]): void {
  doc.setTextColor(c[0], c[1], c[2])
}

function setDraw(doc: jsPDF, c: readonly number[]): void {
  doc.setDrawColor(c[0], c[1], c[2])
}

function controlRgb(control: ControlType): readonly number[] {
  return control === 'CCP' ? C.red : control === 'OPRP' ? C.orange : C.peach
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function sectionLabel(doc: jsPDF, label: string, x: number, y: number): void {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  setText(doc, C.red)
  doc.text(label.toUpperCase(), x, y)
}

function bodyText(doc: jsPDF, text: string, x: number, y: number, maxW: number, size = 12.5): number {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(size)
  setText(doc, C.text)
  const lines = doc.splitTextToSize(text, maxW)
  doc.text(lines, x, y)
  return y + lines.length * (size * 0.48) + 2
}

function chip(doc: jsPDF, label: string, x: number, y: number, color: readonly number[]): void {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  const textW = doc.getTextWidth(label)
  const w = textW + 14
  setFill(doc, color)
  doc.roundedRect(x, y, w, 9, 4.5, 4.5, 'F')
  if (color === C.red) {
    setDraw(doc, [0, 0, 0])
    doc.setLineWidth(0.6)
    doc.roundedRect(x, y, w, 9, 4.5, 4.5, 'S')
  }
  const dark = color === C.peach || color === C.orange
  doc.setTextColor(dark ? 14 : 255, dark ? 14 : 255, dark ? 14 : 255)
  doc.text(label, x + w / 2, y + 6, { align: 'center' })
}

function drawCover(doc: jsPDF, stages: Stage[], logoDataUrl?: string): void {
  setFill(doc, C.ink)
  doc.rect(0, 0, W, H, 'F')

  setDraw(doc, C.red)
  doc.setLineWidth(0.4)
  doc.roundedRect(12, 12, W - 24, H - 24, 6, 6, 'S')

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', W / 2 - 24, 16, 48, 48)
  } else {
    setFill(doc, C.red)
    doc.circle(W / 2, 40, 24, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(34)
    doc.setTextColor(255, 255, 255)
    doc.text('C', W / 2, 45, { align: 'center' })
  }

  setText(doc, C.red)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(40)
  doc.text('WAFER JOURNEY!', W / 2, 74, { align: 'center' })
  doc.setFontSize(16)
  setText(doc, C.text)
  doc.setFont('helvetica', 'normal')
  doc.text('Production & Quality Control', W / 2, 82.5, { align: 'center' })
  doc.setFontSize(10.5)
  setText(doc, C.dim)
  doc.text('Stage-by-stage quality control across the production line', W / 2, 89.5, { align: 'center' })

  setFill(doc, C.card)
  doc.roundedRect(30, 100, W - 60, 54, 4, 4, 'F')
  setDraw(doc, C.red)
  doc.roundedRect(30, 100, W - 60, 54, 4, 4, 'S')
  setText(doc, C.red)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('NOT OFFICIAL', W / 2, 109, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(232, 230, 220)
  const disc = doc.splitTextToSize(SITE.disclaimer, W - 80)
  doc.text(disc, 40, 117)

  setText(doc, C.red)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13.5)
  doc.text('Made by AUG round QA interns 2026', W / 2, 166, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  setText(doc, C.dim)
  doc.text('August 2026', W / 2, 173, { align: 'center' })

  setText(doc, C.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('The Journey', 30, 180)

  const half = Math.ceil(stages.length / 2)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  stages.forEach((stage, i) => {
    const col = i < half ? 0 : 1
    const row = i < half ? i : i - half
    const x = 30 + col * 95
    const y = 186 + row * 5.0
    setText(doc, C.red)
    doc.setFont('helvetica', 'bold')
    doc.text(`${pad2(stage.num)}`, x, y)
    doc.setFont('helvetica', 'normal')
    setText(doc, C.text)
    doc.text(stage.title, x + 9, y)
  })
}

function drawProgress(doc: jsPDF, current: number, total: number): void {
  const startX = M
  const endX = W - M
  const gap = (endX - startX) / (total - 1)
  const y = H - 18
  for (let i = 1; i <= total; i++) {
    const x = startX + (i - 1) * gap
    if (i <= current) {
      setFill(doc, C.red)
      doc.circle(x, y, 2.4, 'F')
    } else {
      setDraw(doc, C.dim)
      doc.setLineWidth(0.4)
      doc.circle(x, y, 2.2, 'S')
    }
  }
}

function drawStagePage(doc: jsPDF, stage: Stage, total: number): void {
  doc.addPage()

  setFill(doc, C.ink)
  doc.rect(0, 0, W, H, 'F')
  setFill(doc, C.red)
  doc.rect(0, 0, W, 30, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(255, 255, 255)
  doc.text(`STAGE ${pad2(stage.num)}  ·  ${stage.title}`, M, 19)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`${stage.num} / ${total}`, W - M, 19, { align: 'right' })

  const leftX = M
  const leftW = 150
  const rightX = 178
  const rightW = W - rightX - M

  let y = 46

  sectionLabel(doc, 'PROCESS', leftX, y)
  y = bodyText(doc, stage.process, leftX, y + 7, leftW, 12.5)

  if (stage.machine) {
    sectionLabel(doc, 'MACHINES', leftX, y + 9)
    y = bodyText(doc, stage.machine, leftX, y + 16, leftW, 12.5)
  }

  sectionLabel(doc, 'QA ENGINEER ROLE', leftX, y + 9)
  setFill(doc, C.pink)
  doc.roundedRect(leftX, y + 16, leftW, 26, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12.5)
  doc.setTextColor(14, 14, 14)
  const roleLines = doc.splitTextToSize(stage.qaRole, leftW - 14)
  doc.text(roleLines, leftX + 7, y + 23.5)
  y = y + 16 + 26 + 9

  sectionLabel(doc, 'CONTROL', rightX, 46)
  chip(doc, `${stage.control} — ${CONTROL_LABEL[stage.control]}`, rightX, 55, controlRgb(stage.control))

  sectionLabel(doc, 'QA CHECKS', rightX, 78)
  let cy = 85
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  stage.checks.forEach((check) => {
    const lines = doc.splitTextToSize(check, rightW - 11)
    setText(doc, C.red)
    doc.text('•', rightX, cy)
    setText(doc, C.text)
    doc.text(lines, rightX + 6, cy)
    cy += lines.length * 6 + 3
  })

  drawProgress(doc, stage.num, total)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  setText(doc, C.dim)
  doc.text(SITE.madeBy, M, H - 8)
  doc.text(`Page ${doc.getNumberOfPages()} of ${total + 1}`, W - M, H - 8, { align: 'right' })
}

export interface MultiPagePdfOptions {
  logoDataUrl?: string
}

export async function buildMultiPagePdf(stages: Stage[], opts: MultiPagePdfOptions = {}): Promise<jsPDF> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  drawCover(doc, stages, opts.logoDataUrl)
  stages.forEach((stage) => drawStagePage(doc, stage, stages.length))
  return doc
}

export async function buildSinglePagePdf(canvas: HTMLCanvasElement): Promise<jsPDF> {
  const { jsPDF } = await import('jspdf')
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
  const pageH = (canvas.height / Math.max(1, canvas.width)) * W
  const doc = new jsPDF({ unit: 'mm', format: [W, pageH], orientation: 'landscape' })
  doc.addImage(dataUrl, 'JPEG', 0, 0, W, pageH)
  return doc
}
