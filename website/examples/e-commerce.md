# E-commerce, one store per subdomain

A platform where each merchant has a store on its own subdomain (`my-store.example.com`), with one page per product (`/my-product`). The SPA and the API are shared by every store.

## Server

```js
// server.cjs
const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const { createSeoMiddleware } = require('spa-meta-tags')

const api_url = process.env.API_URL || 'http://localhost:8000'
const dist = path.resolve(__dirname, 'dist')

const app = express()

app.use(express.static(dist, { index: false }))

app.use(createSeoMiddleware({
  template: fs.readFileSync(path.join(dist, 'index.html'), 'utf8'),
  timeout: 3000,
  cache: { ttl: 5 * 60 * 1000 },

  defaults: ({ origin }) => ({
    title: 'My platform',
    siteName: 'My platform',
    locale: 'en_US',
    image: `${origin}/og-image.jpg`,
  }),

  async resolve ({ host, path: page_path }) {
    const store_domain = host.split('.', 1)[0]
    const slug = decodeURIComponent(page_path.slice(1))

    const get = url => fetch(url, { signal: AbortSignal.timeout(2500) }).then(r => (r.ok ? r.json() : null))

    const [store, product] = await Promise.all([
      get(`${api_url}/stores/${store_domain}`),
      slug ? get(`${api_url}/stores/${store_domain}/products/${encodeURIComponent(slug)}`) : null,
    ])

    // Unknown store
    if (!store) return { robots: 'noindex', status: 404 }

    // Home page of the store, or unknown product
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

app.listen(process.env.PORT || 3000)
```

## What crawlers get

For `https://my-store.example.com/barca-2026-jersey`:

```html
<title>Barça 2026 Jersey | My Store</title>
<meta name="description" content="The authentic and lightweight jersey">
<meta property="og:type" content="product">
<meta property="og:site_name" content="My Store">
<meta property="og:url" content="https://my-store.example.com/barca-2026-jersey">
<meta property="og:image" content="https://cdn.example.com/jersey.jpg">
<meta property="product:price:amount" content="15000">
<meta property="product:price:currency" content="XOF">
<link rel="icon" href="https://cdn.example.com/my-store/favicon.png">
```

## Notes

- The reverse proxy must forward the real subdomain: see [Production checklist](../guide/production#reverse-proxy).
- The cache is kept per subdomain, so two stores never share an entry.
- If your API finds the store from the `Origin` header instead of the URL, forward it: see [One site per subdomain](../guide/multi-tenant#when-your-api-identifies-the-customer-from-the-request).

The full file is in the repository: [`examples/express-spa.cjs`](https://github.com/roazagba/spa-meta-tags/blob/main/examples/express-spa.cjs).
