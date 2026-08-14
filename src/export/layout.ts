import type { Stage, ControlType } from '../data/stages'

export interface NodeRect {
  stage: Stage
  x: number
  y: number
  w: number
  h: number
  row: number
  col: number
}

export interface FlowLayout {
  width: number
  height: number
  headerH: number
  footerH: number
  nodes: NodeRect[]
  cols: number
  nodeW: number
  nodeH: number
  gapX: number
  gapY: number
  padX: number
}

export const FLOW = {
  padX: 100,
  cols: 3,
  nodeH: 820,
  gapX: 70,
  gapY: 70,
  headerH: 300,
  footerH: 140,
} as const

export const FLOW_WIDTH = 3400

export function computeFlowLayout(stages: Stage[], width = 2400): FlowLayout {
  const padX = FLOW.padX
  const cols = FLOW.cols
  const content = Math.max(0, width - padX * 2)
  const gapX = FLOW.gapX
  const nodeW = Math.max(220, Math.floor((content - (cols - 1) * gapX) / cols))
  const rows = Math.ceil(stages.length / cols)

  const nodes: NodeRect[] = stages.map((stage, i) => {
    const row = Math.floor(i / cols)
    const posInRow = i % cols
    const col = row % 2 === 0 ? posInRow : cols - 1 - posInRow
    const x = padX + col * (nodeW + gapX)
    const y = FLOW.headerH + row * (FLOW.nodeH + FLOW.gapY)
    return { stage, x, y, w: nodeW, h: FLOW.nodeH, row, col }
  })

  return {
    width,
    height: FLOW.headerH + rows * FLOW.nodeH + (rows - 1) * FLOW.gapY + FLOW.footerH,
    headerH: FLOW.headerH,
    footerH: FLOW.footerH,
    nodes,
    cols,
    nodeW,
    nodeH: FLOW.nodeH,
    gapX,
    gapY: FLOW.gapY,
    padX,
  }
}

export function controlColor(control: ControlType): string {
  return control === 'CCP' ? '#dc0816' : control === 'OPRP' ? '#f97d41' : '#ffddc2'
}

export function chipTextColor(control: ControlType): string {
  return control === 'CP' || control === 'OPRP' ? '#0E0E0E' : '#FFFFFF'
}
