import { SITE } from '../core/brand'
import { LOGO_SRC, PRODUCT } from '../core/assets'
import { HeroWafers } from './HeroWafers'

export function Hero() {
  return (
    <section id="hero" className="hero">
      <HeroWafers />
      <div className="hero-inner">
        <div className="hero-brand-row">
          <img className="hero-logo" src={LOGO_SRC} alt="" width="96" height="96" aria-hidden="true" />
          <p className="hero-kicker">
            <span className="tag-dot" aria-hidden="true" /> NOT OFFICIAL
            <span className="hero-kicker-sub">· made by AUG round QA interns 2026</span>
          </p>
        </div>
        <h1 className="hero-title">
          The <span>WAFER</span>
          <br />
          Journey
        </h1>
        <p className="hero-sub">{SITE.title} — a stage-by-stage look at the production line and the QA engineer role at every checkpoint.</p>
        <div className="hero-product">
          <img className="hero-product-img" src={PRODUCT.single} alt="Finished Munchi wafer" />
          <p className="hero-product-call">Start the journey with Munchi!</p>
        </div>
        <a className="btn btn-primary btn-lg" href="#journey">
          Start the journey ↓
        </a>
      </div>
    </section>
  )
}
