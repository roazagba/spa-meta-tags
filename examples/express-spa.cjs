/**
 * Example: Vite SPA (Vue, React...) of a multi-store e-commerce platform served by Express.
 * Each store has its own subdomain (https://my-store.example.com) and each product its page (/my-product).
 *
 *   API_URL=https://api.example.com node examples/express-spa.cjs
 */
const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const { createSeoMiddleware } = require('spa-meta-tags')

const port = process.env.PORT || 3000
const api_url = process.env.API_URL || 'http://localhost:8000'
const dist = path.resolve(__dirname, process.env.DIST || 'dist')

const app = express()

// 1. Static files of the build (JS, CSS, images...), without serving index.html
app.use(express.static(dist, { index: false }))

// 2. All the pages: index.html with the SEO tags of the page
app.use(createSeoMiddleware({
  template: fs.readFileSync(path.join(dist, 'index.html'), 'utf8'),
  timeout: 3000,
  cache: { ttl: 5 * 60 * 1000 },

  defaults: ({ origin }) => ({
    title: 'My platform',
    siteName: 'My platform',
    locale: 'en_US',
    image: `${origin}/favicon.png`,
  }),

  // The store is identified by the subdomain of the visitor
  async resolve ({ host, path: page_path }) {
    const store_domain = host.split('.', 1)[0]
    const slug = decodeURIComponent(page_path.slice(1))

    const get = url => fetch(url, { headers: { Accept: 'application/json' } }).then(r => (r.ok ? r.json() : null))

    const [store, product] = await Promise.all([
      get(`${api_url}/stores/${store_domain}`),
      slug ? get(`${api_url}/stores/${store_domain}/products/${encodeURIComponent(slug)}`) : null,
    ])

    // Unknown store: defaults with a 404 status
    if (!store) return { robots: 'noindex', status: 404 }

    // Unknown product: store page
    if (!product) {
      return {
        title: store.name,
        siteName: store.name,
        description: store.about || `Welcome to ${store.name}`,
        image: store.logo_url,
        favicon: store.favicon_url,
      }
    }

    return {
      title: `${product.name} | ${store.name}`,
      siteName: store.name,
      description: product.description,
      image: product.images?.[0]?.url ?? store.logo_url,
      favicon: store.favicon_url,
      type: 'product',
      meta: [
        { property: 'product:price:amount', content: String(product.price) },
        { property: 'product:price:currency', content: product.currency },
      ],
    }
  },

  onError: (error, { url }) => console.error(`[seo] ${url.href}`, error),
}))

app.listen(port, () => console.log(`SPA on http://localhost:${port}`))
