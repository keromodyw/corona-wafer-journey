import { useEffect, useRef, useState } from 'react'
import { STAGES } from '../data/stages'
import { renderFlowchart } from '../export/toCanvas'
import { FLOW_WIDTH } from '../export/layout'
import { exportJpg, exportPdfSingle, exportPdfMulti, exportNormalChart } from '../export'
import { NORMAL_CHART_SRC } from '../core/assets'
import { log } from '../core/log'

type BusyKey = 'normal' | 'jpg' | 'pdf-single' | 'pdf-multi'

interface Toast {
  kind: 'ok' | 'err'
  msg: string
}

export function FlowchartSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [busy, setBusy] = useState<BusyKey | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    let alive = true
    renderFlowchart(STAGES, { width: FLOW_WIDTH, scale: 0.4 })
      .then((canvas) => {
        if (!alive || !canvasRef.current) return
        canvasRef.current.width = canvas.width
        canvasRef.current.height = canvas.height
        canvasRef.current.getContext('2d')?.drawImage(canvas, 0, 0)
      })
      .catch((err) => log.error(`preview: ${String(err)}`))
    return () => {
      alive = false
    }
  }, [])

  const showToast = (next: Toast) => {
    setToast(next)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setToast(null), 4200)
  }

  const runExport = async (key: BusyKey, fn: () => Promise<void>, okMsg: string) => {
    if (busy) return
    setBusy(key)
    try {
      await fn()
      showToast({ kind: 'ok', msg: okMsg })
    } catch (err) {
      log.error(`export:${key}: ${String(err)}`)
      showToast({ kind: 'err', msg: 'Export failed. Please try again.' })
    } finally {
      setBusy(null)
    }
  }

  const normalButtons: { key: BusyKey; label: string; fn: () => Promise<void>; ok: string }[] = [
    { key: 'normal', label: 'Download Normal Flowhart', fn: () => exportNormalChart(), ok: 'Photo downloaded.' },
  ]

  const flowButtons: { key: BusyKey; label: string; fn: () => Promise<void>; ok: string }[] = [
    { key: 'jpg', label: 'Download JPG', fn: () => exportJpg(STAGES), ok: 'JPG flowchart downloaded.' },
    { key: 'pdf-single', label: 'Download PDF · 1 page', fn: () => exportPdfSingle(STAGES), ok: 'Single-page PDF downloaded.' },
    { key: 'pdf-multi', label: 'Download PDF · detailed', fn: () => exportPdfMulti(STAGES), ok: 'Detailed multi-page PDF downloaded.' },
  ]

  const renderRow = (title: string, buttons: typeof normalButtons) => (
    <div className="flow-actions-row">
      <span className="flow-row-title">{title}</span>
      <div className="flow-actions">
        {buttons.map((btn) => (
          <button
            key={btn.key}
            className={`btn ${btn.key === 'normal' ? 'btn-primary' : 'btn-ghost'}`}
            disabled={busy !== null}
            onClick={() => runExport(btn.key, btn.fn, btn.ok)}
          >
            {busy === btn.key ? 'Preparing…' : btn.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <section className="flowchart" id="flowchart">
      <h2>The Flowchart</h2>
      <div className="flowchart-charts">
        <div className="flowchart-chart">
          <figure className="flowchart-preview">
            <img src={NORMAL_CHART_SRC} alt="Normal production flowchart" />
          </figure>
          <figcaption className="flowchart-cap">Normal Flowchart - 1</figcaption>
          {renderRow('Normal Flowchart - 1', normalButtons)}
        </div>
        <div className="flowchart-chart">
          <figure className="flowchart-preview">
            <canvas ref={canvasRef} aria-label="Preview of the wafer production flowchart" role="img" />
          </figure>
          <figcaption className="flowchart-cap">Flowchart - 2</figcaption>
          {renderRow('Flowchart - 2', flowButtons)}
        </div>
      </div>
      <div aria-live="polite">
        {toast && (
          <div className={`toast ${toast.kind}`} role="status">
            {toast.msg}
          </div>
        )}
      </div>
    </section>
  )
}
