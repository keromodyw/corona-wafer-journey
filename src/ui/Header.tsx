import { LOGO_SRC } from '../core/assets'

interface HeaderProps {
  qaVisible: boolean
  onToggleQa: () => void
}

export function Header({ qaVisible, onToggleQa }: HeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="#hero" aria-label="WAFER Journey — back to top">
        <img className="brand-logo" src={LOGO_SRC} alt="Corona logo (illustrative)" width="40" height="40" />
        <span className="brand-word">
          WAFER <em>Journey!</em>
        </span>
      </a>
      <label className="qa-switch">
        <input type="checkbox" checked={qaVisible} onChange={onToggleQa} />
        <span className="qa-switch-track" aria-hidden="true">
          <span className="qa-switch-thumb" />
        </span>
        <span className="qa-switch-label">Quality Instructions</span>
      </label>
      <span className="header-tag">
        <span className="tag-dot" aria-hidden="true" />
        NOT OFFICIAL
        <span className="tag-sub">· made by AUG round QA interns 2026</span>
      </span>
    </header>
  )
}
