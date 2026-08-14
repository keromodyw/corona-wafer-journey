import { useEffect, useRef } from 'react'
import { SITE } from '../core/brand'
import { LOGO_SRC, INTERNS } from '../core/assets'
import { log } from '../core/log'

interface DisclaimerProps {
  onAccept: () => void
}

export function Disclaimer({ onAccept }: DisclaimerProps) {
  const okRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    okRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onAccept()
        log.info('disclaimer:accepted')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onAccept])

  return (
    <div className="disclaimer" role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
      <div className="disclaimer-card">
        <div className="disclaimer-top">
          <img className="disclaimer-logo" src={LOGO_SRC} alt="Corona logo (illustrative)" width="88" height="88" />
          <span className="disclaimer-badge">NOT OFFICIAL</span>
        </div>
        <h1 id="disclaimer-title">What is this?</h1>
        <p className="disclaimer-text">{SITE.disclaimer}</p>
        <div className="interns">
          {INTERNS.map((intern) => (
            <figure key={intern.name} className="intern">
              {intern.src ? (
                <img className="intern-photo" src={intern.src} alt={intern.alt} width="104" height="104" />
              ) : (
                <span className="intern-photo intern-placeholder" aria-label="Second intern photo coming soon">
                  ?
                </span>
              )}
              <figcaption className="intern-name">{intern.name}</figcaption>
              {intern.linkedin ? (
                <a className="btn-linkedin" href={intern.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn ↗
                </a>
              ) : (
                <span className="btn-linkedin btn-linkedin-empty" aria-disabled="true">
                  LinkedIn — coming soon
                </span>
              )}
            </figure>
          ))}
        </div>
        <p className="disclaimer-by">
          Made by <strong>AUG round QA interns 2026</strong>
        </p>
        <button ref={okRef} className="btn btn-primary" onClick={onAccept}>
          OK — Start the WAFER JOURNEY
        </button>
      </div>
    </div>
  )
}
