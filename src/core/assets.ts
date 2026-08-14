export const LOGO_SRC = `${import.meta.env.BASE_URL}logo/corona-logo.jpg`
export const PRODUCT = {
  single: `${import.meta.env.BASE_URL}product/wafer-single.png`,
  poster: `${import.meta.env.BASE_URL}product/wafer-poster.jpg`,
  desc: 'Wafer — Four light, crunchy pieces of wafer topped on three layers of the smoothest cream filling that will leave you wanting more.',
} as const

export const INTERNS: readonly { src?: string; alt?: string; name: string; linkedin?: string }[] = [
  {
    src: `${import.meta.env.BASE_URL}interns/intern-1.jpg`,
    alt: 'Kirolos Mody — QA intern photo',
    name: 'Kirolos Mody',
    linkedin: 'https://www.linkedin.com/in/kirolos-mody',
  },
  { name: 'Jana' },
]

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}
