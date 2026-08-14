import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Stage } from '../data/stages'
import { CONTROL_LABEL } from '../data/stages'

const StageIllustration = lazy(() => import('../three/StageIllustration'))

interface StageSectionProps {
  stage: Stage
  motionOk: boolean
  qaVisible: boolean
}

export function StageSection({ stage, motionOk, qaVisible }: StageSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [show3d, setShow3d] = useState(false)

  useEffect(() => {
    const el = cardRef.current
    if (!el || !motionOk) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      toggleClass: { targets: el, className: 'in-view' },
    })
    return () => st.kill()
  }, [motionOk, stage.id])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShow3d(true)
            io.disconnect()
            break
          }
        }
      },
      { rootMargin: '300px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const pad = String(stage.num).padStart(2, '0')

  return (
    <section className="stage" id={`stage-${stage.num}`} data-num={stage.num}>
      <div className="stage-num" aria-hidden="true">
        {pad}
      </div>
      <div ref={cardRef} className={`stage-card ctl-${stage.control.toLowerCase()}`}>
        <div className="stage-top">
          <span className="stage-badge">STAGE {pad}</span>
        </div>
        <div className="stage-body">
          <div className="stage-illu">
            {show3d ? (
              <Suspense fallback={<div className="illu-fallback" aria-hidden="true">{stage.emoji}</div>}>
                <StageIllustration stage={stage} animate={motionOk} />
              </Suspense>
            ) : (
              <div className="illu-fallback" aria-hidden="true">
                {stage.emoji}
              </div>
            )}
          </div>
          <div className="stage-content">
            <div className="stage-title-row">
              <h3 className={stage.impact ? 'impact' : ''}>{stage.title}</h3>
              {stage.subtitle && <p className="stage-sub">{stage.subtitle}</p>}
            </div>
            <p className="stage-process">{stage.process}</p>
            {stage.fix && (
              <div className="stage-fix">
                {stage.fix.wrong && <del className="fix-wrong">{stage.fix.wrong}</del>}
                <span className="fix-right">{stage.fix.right}</span>
              </div>
            )}
            {stage.machine && (
              <p className="stage-machine">
                <span>Machines</span>
                {stage.machine}
              </p>
            )}
            {qaVisible && (
              <div className="stage-qa">
                <div className="qa-head">
                  <span className="qa-label">QA ENGINEER</span>
                  <span className="chip" title={CONTROL_LABEL[stage.control]}>
                    {stage.control}
                  </span>
                </div>
                <p className="qa-instr">{stage.qaRole}</p>
                <div className="qa-todos">
                  <span className="qa-todos-label">TO DO</span>
                  <ul className="stage-checks">
                    {stage.checks.map((check) => (
                      <li key={check}>{check}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
