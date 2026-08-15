import type { Stage } from '../data/stages'
import { renderFlowchart, canvasToBlob, loadLogoDataUrl, loadAvatarDataUrl } from './toCanvas'
import { buildMultiPagePdf, buildSinglePagePdf } from './toPdf'
import { downloadBlob, NORMAL_CHART_SRC, INTERNS } from '../core/assets'
import { log } from '../core/log'

export async function exportJpg(stages: Stage[]): Promise<void> {
  log.info('export:jpg:start')
  const canvas = await renderFlowchart(stages)
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9)
  downloadBlob(blob, 'munchi-qa-flowchart.jpg')
  log.info('export:jpg:done')
}

export async function exportNormalChart(): Promise<void> {
  log.info('export:normal:start')
  const res = await fetch(NORMAL_CHART_SRC)
  if (!res.ok) throw new Error(`photo fetch failed: ${res.status}`)
  const blob = await res.blob()
  downloadBlob(blob, 'normal-flowchart.jpg')
  log.info('export:normal:done')
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
  const { captureStageImages } = await import('../three/capture')
  const [logoDataUrl, stageImages, interns] = await Promise.all([
    loadLogoDataUrl(),
    captureStageImages(stages),
    Promise.all(
      INTERNS.map(async (intern) => ({
        name: intern.name,
        linkedin: intern.linkedin,
        photo: intern.src ? await loadAvatarDataUrl(intern.src, 160) : undefined,
      })),
    ),
  ])
  const doc = await buildMultiPagePdf(stages, { logoDataUrl, stageImages, interns })
  downloadBlob(doc.output('blob'), 'munchi-qa-journey-detailed.pdf')
  log.info('export:pdf-multi:done')
}
