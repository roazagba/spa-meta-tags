# Getting started

## Requirements

- Node.js 18 or newer.
- A SPA served by a Node server (Express or other). For static hosting without a Node server, see [Static hosting](./static-hosting).

## Installation

::: code-group

```bash [npm]
npm install spa-meta-tags
```

```bash [pnpm]
pnpm add spa-meta-tags
```

```bash [yarn]
yarn add spa-meta-tags
```

:::

The package works with both `import` and `require`:

```js
// ES modules
import { createSeoMiddleware } from 'spa-meta-tags'

// CommonJS (server.cjs)
const { createSeoMiddleware } = require('spa-meta-tags')
```

## A first server

This server serves the build of a Vite app (`dist/`) and gives each product page its own preview.

```js
// server.cjs
const fs = require('node:fs')
const express = require('express')
const { createSeoMiddleware } = require('spa-meta-tags')

const app = express()

// 1. Static files of the build (JS, CSS, images), without index.html
app.use(express.static('dist', { index: false }))

// 2. Every page: index.html with the tags of the page
app.use(createSeoMiddleware({
  template: fs.readFileSync('dist/index.html', 'utf8'),

  // Used for every page, and when the resolver returns nothing
  defaults: {
    title: 'My Store',
    siteName: 'My Store',
    description: 'Jerseys and sportswear',
    image: 'https://shop.example.com/og-image.jpg',
  },

  // Returns the SEO data of the requested page
  async resolve ({ path }) {
    const slug = path.slice(1)
    if (!slug) return null // home page: defaults

    const response = await fetch(`https://api.example.com/products/${slug}`)
    if (!response.ok) return null

    const product = await response.json()

    return {
      title: `${product.name} | My Store`,
      description: product.description, // HTML is converted to plain text
      image: product.image_url,
      type: 'product',
    }
  },
}))

app.listen(3000)
```

Start it and look at the HTML a crawler receives:

```bash
node server.cjs
curl -s -A "facebookexternalhit/1.1" http://localhost:3000/barca-2026-jersey | grep -E "<title>|og:"
```

You should see the title, the description and the image of the product.

::: tip Two important details
- `express.static('dist', { index: false })`: without `index: false`, Express would serve `dist/index.html` for `/` directly, without the tags.
- The middleware must come **after** the static files: it handles every page request and replaces the usual "send index.html for every route" fallback of SPAs.
:::

## What happens when the API fails

If the resolver throws an error, or takes more than 3 seconds, the page is still served with the `defaults`. Visitors never wait for a broken API. See [The resolver](./resolver#errors-and-timeouts).

## Next steps

- [How it works](./how-it-works): what the middleware does with each request.
- [The resolver](./resolver): everything the resolver receives and can return.
- [Production checklist](./production): proxy headers, images, `robots.txt`.
- [Testing link previews](./testing-previews): check the result on Facebook, WhatsApp and LinkedIn.
