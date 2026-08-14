import { useEffect, useRef, useState } from 'react'
import { STAGES } from '../data/stages'
import { renderFlowchart } from '../export/toCanvas'
import { FLOW_WIDTH } from '../export/layout'
import { exportJpg, exportPdfSingle, exportPdfMulti, exportNormalChart } from '../export'
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

  const buttons: { key: BusyKey; label: string; fn: () => Promise<void>; ok: string }[] = [
    { key: 'normal', label: 'Download normal chart', fn: () => exportNormalChart(), ok: 'Photo downloaded.' },
    { key: 'jpg', label: 'Download JPG', fn: () => exportJpg(STAGES), ok: 'JPG flowchart downloaded.' },
    { key: 'pdf-single', label: 'Download PDF · 1 page', fn: () => exportPdfSingle(STAGES), ok: 'Single-page PDF downloaded.' },
    { key: 'pdf-multi', label: 'Download PDF · detailed', fn: () => exportPdfMulti(STAGES), ok: 'Detailed multi-page PDF downloaded.' },
  ]

  return (
    <section className="flowchart" id="flowchart">
      <h2>The Flowchart</h2>
      <div className="flowchart-preview">
        <canvas ref={canvasRef} aria-label="Preview of the wafer production flowchart" role="img" />
      </div>
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
