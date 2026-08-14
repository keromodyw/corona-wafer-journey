import type { Stage } from '../data/stages'
import { renderFlowchart, canvasToBlob, loadLogoDataUrl } from './toCanvas'
import { buildMultiPagePdf, buildSinglePagePdf } from './toPdf'
import { downloadBlob } from '../core/assets'
import { log } from '../core/log'

export async function exportJpg(stages: Stage[]): Promise<void> {
  log.info('export:jpg:start')
  const canvas = await renderFlowchart(stages)
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9)
  downloadBlob(blob, 'munchi-qa-flowchart.jpg')
  log.info('export:jpg:done')
}

export async function exportPdfSingle(stages: Stage[]): Promise<void> {
  log.info('export:pdf-single:start')
  const canvas = await renderFlowchart(stages)
  const doc = await buildSinglePagePdf(canvas)
  downloadBlob(doc.output('blob'), 'munchi-qa-flowchart.pdf')
  log.info('export:pdf-single:done')
}

export async function exportPdfMulti(stages: Stage[]): Promise<void> {
  log.info('export:pdf-multi:start')
  const doc = await buildMultiPagePdf(stages, { logoDataUrl: await loadLogoDataUrl() })
  downloadBlob(doc.output('blob'), 'munchi-qa-journey-detailed.pdf')
  log.info('export:pdf-multi:done')
}
