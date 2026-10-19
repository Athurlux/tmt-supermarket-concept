import { Link } from 'react-router'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function About() {
  useDocumentTitle('About')
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container about-hero__inner">
          <div>
            <p className="eyebrow">About</p>
            <h1 className="page-title">The neighbourhood shop, made a little more beautiful.</h1>
            <p className="lede">
              A good supermarket is part of the rhythm of a neighbourhood — the quick stop for bread and milk, the weekly shop,
              the hunt for one particular ingredient. This concept imagines that everyday convenience online, for Muyenga and Bukoto.
            </p>
          </div>
          <picture className="about-hero__image">
            <source media="(max-width: 699px)" srcSet="/images/hero-mobile-640.webp 640w, /images/hero-mobile-1024.webp 1024w" sizes="100vw" width={1024} height={1536} />
            <img src="/images/hero-desktop-960.webp" srcSet="/images/hero-desktop-960.webp 960w, /images/hero-desktop-1536.webp 1536w" sizes="(min-width: 900px) 50vw, 100vw" width={1536} height={1024} alt="Concept art: a kraft TMT grocery bag filled with pineapple, bananas, bread, milk, tomatoes and greens, with oranges around it" loading="lazy" />
          </picture>
        </div>
      </section>

      <section className="container about-pillars" aria-label="What shapes this concept">
        <article>
          <h2>Warm, not loud</h2>
          <p>Cream and forest green give the produce room to shine; orange is saved for the moments that matter — a headline, a basket, a call to action.</p>
        </article>
        <article>
          <h2>Fresh first</h2>
          <p>Fruit, vegetables and bread lead the way, because they are what most people come in for and what most needs to look right.</p>
        </article>
        <article>
          <h2>Everyday convenience</h2>
          <p>Search, a basket that remembers you, and a clear choice between delivery and collection — so a weekday shop takes minutes.</p>
        </article>
      </section>

      <section className="container disclosure" id="concept" tabIndex={-1} aria-labelledby="concept-title">
        <h2 id="concept-title" className="section-title">About this concept</h2>
        <div className="disclosure__body">
          <p>
            This website is an <strong>independent developer portfolio concept</strong>. It is not affiliated with, endorsed by or operated
            for TMT Supermarket, and it is not TMT Supermarket’s official website or ordering service.
          </p>
          <ul>
            <li>Products, prices, units and availability are <strong>demonstration data</strong>, not TMT pricing or inventory.</li>
            <li>The delivery fee, collection fee and time windows are an illustrative policy for the demo.</li>
            <li>No payments are taken. Checkouts and enquiries are completed in your browser and are <strong>never sent</strong>.</li>
            <li>Your basket is remembered on this device; personal details you type are kept only in memory for the current visit.</li>
            <li>All product, department, delivery and bag imagery is <strong>AI-generated concept art</strong>. The TMT wordmark shown is a concept treatment, not an official logo file. No image depicts real staff or branches.</li>
            <li>Branch locations come from TMT Supermarket’s public social posts; unverified details such as hours and phone numbers are omitted.</li>
          </ul>
        </div>
        <div className="button-row">
          <Link to="/shop" className="button button--primary">Explore the shop</Link>
          <Link to="/contact" className="button button--outline">Try the enquiry form</Link>
        </div>
      </section>
    </div>
  )
}
