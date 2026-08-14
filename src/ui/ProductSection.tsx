import { PRODUCT } from '../core/assets'

export function ProductSection() {
  return (
    <section className="product" id="product">
      <h2>The Final Product</h2>
      <p className="product-desc">{PRODUCT.desc}</p>
      <div className="product-grid">
        <figure className="product-card">
          <img className="product-single" src={PRODUCT.single} alt="The packaged wafer — single item" loading="lazy" />
        </figure>
        <figure className="product-card">
          <img className="product-poster" src={PRODUCT.poster} alt="Poster showing all wafer types" loading="lazy" />
          <figcaption>All wafer types</figcaption>
        </figure>
      </div>
    </section>
  )
}
