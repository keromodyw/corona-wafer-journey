import { SITE } from '../core/brand'
import { LOGO_SRC } from '../core/assets'

interface FooterProps {
  onShowDisclaimer: () => void
}

export function Footer({ onShowDisclaimer }: FooterProps) {
  return (
    <footer className="site-footer">
      <img className="footer-logo" src={LOGO_SRC} alt="Corona logo (illustrative)" width="44" height="44" />
      <p className="footer-made">{SITE.madeBy}</p>
      <button className="btn btn-ghost btn-sm" onClick={onShowDisclaimer}>
        Show disclaimer
      </button>
    </footer>
  )
}
