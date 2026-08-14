import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { STAGES } from '../src/data/stages'
import { computeFlowLayout, FLOW_WIDTH } from '../src/export/layout'
import { buildMultiPagePdf } from '../src/export/toPdf'

function fail(msg: string): never {
  throw new Error(`SMOKE FAIL: ${msg}`)
}

const layout = computeFlowLayout(STAGES, FLOW_WIDTH)
if (layout.nodes.length !== STAGES.length) fail(`expected ${STAGES.length} nodes, got ${layout.nodes.length}`)
if (layout.width <= layout.height) fail(`expected landscape layout, got ${layout.width}x${layout.height}`)
layout.nodes.forEach((n, i) => {
  if (n.w <= 0 || n.h <= 0) fail(`bad node dims at index ${i}`)
  if (n.x < 0 || n.x + n.w > layout.width || n.y < 0 || n.y + n.h > layout.height) fail(`node out of bounds at index ${i}`)
})
for (let i = 0; i < layout.nodes.length; i++) {
  for (let j = i + 1; j < layout.nodes.length; j++) {
    const a = layout.nodes[i]
    const b = layout.nodes[j]
    const overlap = a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    if (overlap) fail(`nodes overlap at ${i} and ${j}`)
  }
}
console.log(`layout: ${layout.width}x${layout.height} (landscape), nodes=${layout.nodes.length} OK`)

const doc = await buildMultiPagePdf(STAGES)
const pages = doc.getNumberOfPages()
if (pages !== STAGES.length + 1) fail(`expected ${STAGES.length + 1} pages, got ${pages}`)

const buf = Buffer.from(doc.output('arraybuffer'))
if (buf.length < 20000) fail(`pdf too small: ${buf.length} bytes`)
const outDir = join(process.cwd(), 'node_modules', '.tmp')
mkdirSync(outDir, { recursive: true })
const out = join(outDir, 'smoke-detailed.pdf')
writeFileSync(out, buf)
console.log(`pdf-multi: ${pages} pages, ${buf.length} bytes -> ${out}`)
console.log('SMOKE OK')
