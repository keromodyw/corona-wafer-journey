import type Lenis from 'lenis'

let lenis: Lenis | null = null

export function setLenis(next: Lenis | null): void {
  lenis = next
}

export function scrollToCenter(el: HTMLElement): void {
  const y = window.scrollY + el.getBoundingClientRect().top + el.offsetHeight / 2 - window.innerHeight / 2
  const target = Math.max(0, y)
  if (lenis) lenis.scrollTo(target)
  else window.scrollTo({ top: target, behavior: 'smooth' })
}
