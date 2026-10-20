# E-commerce, une boutique par sous-domaine

Une plateforme où chaque marchand a sa boutique sur son propre sous-domaine (`my-store.example.com`), avec une page par produit (`/my-product`). La SPA et l'API sont communes à toutes les boutiques.

## Le serveur

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

    // Boutique inconnue
    if (!store) return { robots: 'noindex', status: 404 }

    // Accueil de la boutique, ou produit inconnu
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

## Ce que reçoivent les robots

Pour `https://my-store.example.com/barca-2026-jersey` :

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

## Remarques

- Le proxy doit transmettre le vrai sous-domaine : voir [Liste de contrôle](../guide/production#reverse-proxy).
- Le cache est séparé par sous-domaine : deux boutiques ne partagent jamais une entrée.
- Si votre API trouve la boutique grâce à l'en-tête `Origin` plutôt qu'à l'URL, transmettez-le : voir [Un site par sous-domaine](../guide/multi-tenant#when-your-api-identifies-the-customer-from-the-request).

Le fichier complet est dans le dépôt : [`examples/express-spa.cjs`](https://github.com/roazagba/spa-meta-tags/blob/main/examples/express-spa.cjs).
