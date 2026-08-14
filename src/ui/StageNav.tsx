import { useEffect, useState } from 'react'
import { STAGES } from '../data/stages'
import { scrollToCenter } from '../core/scroll'

export function StageNav() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const els = STAGES.map((s) => document.getElementById(`stage-${s.num}`))
    const update = () => {
      const center = window.innerHeight / 2
      let idx = 0
      for (let i = 0; i < els.length; i++) {
        const el = els[i]
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.top <= center && r.bottom >= center) {
          idx = i
          break
        }
        if (r.top < center) idx = i
      }
      setActive((prev) => (prev === idx ? prev : idx))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <nav className="stage-nav" aria-label="Jump to a stage">
      <span className="stage-nav-cap" aria-hidden="true">
        STAGES
      </span>
      {STAGES.map((stage) => (
        <button
          key={stage.id}
          type="button"
          className={active === stage.num - 1 ? 'active' : ''}
          aria-current={active === stage.num - 1 ? 'true' : undefined}
          title={`Stage ${stage.num}: ${stage.title}`}
          onClick={() => {
            const el = document.getElementById(`stage-${stage.num}`)
            if (el) scrollToCenter(el)
          }}
        >
          {stage.num}
        </button>
      ))}
    </nav>
  )
}
