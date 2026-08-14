import { useCallback, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { Header } from './ui/Header'
import { Disclaimer } from './ui/Disclaimer'
import { Hero } from './ui/Hero'
import { StageSection } from './ui/StageSection'
import { StageNav } from './ui/StageNav'
import { FlowchartSection } from './ui/FlowchartSection'
import { ProductSection } from './ui/ProductSection'
import { Footer } from './ui/Footer'
import { STAGES } from './data/stages'
import { useReducedMotion } from './core/useReducedMotion'
import { setLenis } from './core/scroll'
import { log } from './core/log'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const reduced = useReducedMotion()
  const [accepted, setAccepted] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [qaVisible, setQaVisible] = useState(false)

  const accept = useCallback(() => {
    setAccepted(true)
    setShowDisclaimer(false)
  }, [])

  const motionOk = accepted && !reduced

  useEffect(() => {
    if (!motionOk) return
    const lenis = new Lenis({ lerp: 0.09, anchors: true })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    const tween = gsap.to('#scroll-progress', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    })
    const heroWafer = gsap.to('.hero-wafer3d', {
      x: 90,
      scale: 1.12,
      opacity: 0.25,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 },
    })
    const parallax = gsap.utils.toArray<HTMLElement>('.stage').map((st) => {
      const num = st.querySelector('.stage-num')
      if (!num) return null
      return gsap.to(num, {
        y: -90,
        ease: 'none',
        scrollTrigger: { trigger: st, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })
    requestAnimationFrame(() => ScrollTrigger.refresh())
    log.info('smooth-scroll:active')
    return () => {
      tween.scrollTrigger?.kill()
      heroWafer.scrollTrigger?.kill()
      parallax.forEach((t) => t?.scrollTrigger?.kill())
      gsap.ticker.remove(raf)
      lenis.destroy()
      setLenis(null)
      ScrollTrigger.killAll()
    }
  }, [motionOk])

  return (
    <div className={motionOk ? 'app motion-ok' : 'app'}>
      <div id="scroll-progress" aria-hidden="true" />
      <Header
        qaVisible={qaVisible}
        onToggleQa={() => setQaVisible((v) => !v)}
        onShowDisclaimer={() => setShowDisclaimer(true)}
      />
      <main>
        <Hero />
        <section id="journey" className="journey">
          {STAGES.map((stage) => (
            <StageSection key={stage.id} stage={stage} motionOk={motionOk} qaVisible={qaVisible} />
          ))}
        </section>
        <ProductSection />
        <FlowchartSection />
      </main>
      <StageNav />
      <Footer onShowDisclaimer={() => setShowDisclaimer(true)} />
      {(!accepted || showDisclaimer) && <Disclaimer onAccept={accept} />}
    </div>
  )
}
