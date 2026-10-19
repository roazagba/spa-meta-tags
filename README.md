# spa-meta-tags

Link previews on WhatsApp, Facebook, X, LinkedIn… and SEO for **single-page applications** (Vue, React, Svelte…), without rewriting them with SSR.

## The problem

A SPA renders its content in the browser. Social network crawlers do not run JavaScript: they only see the initial `index.html`, so every page gets the same title and the same image.

## The solution

The Node server serving the SPA calls your API for each requested page, then injects the right tags in the `<head>` of `index.html`: title, description, Open Graph, Twitter, canonical link, favicon, structured data. The application itself does not change.

- No dependencies.
- Works with Express, Connect or the Node `http` server.
- Usable with both `import` and `require` (`server.cjs`).
- If the API is slow or down, the page is still served, with the default values.

## Installation

```bash
npm install spa-meta-tags
```

## Usage with Express

```js
const fs = require('node:fs')
const express = require('express')
const { createSeoMiddleware } = require('spa-meta-tags')

const app = express()

// 1. Build files (JS, CSS, images), without serving index.html
app.use(express.static('dist', { index: false }))

// 2. Every page: index.html with the SEO tags of the page
app.use(createSeoMiddleware({
  template: fs.readFileSync('dist/index.html', 'utf8'),

  defaults: ({ origin }) => ({
    title: 'My Site',
    siteName: 'My Site',
    locale: 'en_US',
    image: `${origin}/favicon.png`,
  }),

  async resolve ({ path, origin }) {
    const product = await fetch(`https://api.example.com/products${path}`).then(r => (r.ok ? r.json() : null))
    if (!product) return null // default values

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

The middleware replaces the usual SPA "serve index.html for every route" fallback. It only handles pages (`GET`/`HEAD` requests without a file extension that accept HTML) and passes everything else along: files, API…

A complete example, for an e-commerce API where each store has its own subdomain, is available in [`examples/express-spa.cjs`](examples/express-spa.cjs).

### In development with Vite

```js
const vite = await require('vite').createServer({ server: { middlewareMode: true }, appType: 'custom' })
app.use(vite.middlewares)

app.use(createSeoMiddleware({
  template: () => fs.promises.readFile('index.html', 'utf8'), // read on each request
  transformHtml: (html, req) => vite.transformIndexHtml(req.originalUrl, html),
  resolve,
}))
```

## The template

Tags are inserted in place of the `<!--seo-head-->` comment when it is present, otherwise right before `</head>`.

Template tags redefined by the page (`<title>`, `description`, `og:*`, `twitter:*`, `canonical`, favicon) are removed to avoid duplicates. The others are kept. You can therefore keep default values in `index.html`: they are used when the page is not served by the SEO server.

## The resolver

`resolve(context)` receives the request context and returns the SEO data of the page, or `null` to use the default values.

| Context field | Example | Description |
|---|---|---|
| `origin` | `https://shop.example.com` | Origin of the visitor, behind the proxy |
| `host` | `shop.example.com` | Domain of the visitor, useful when each customer has its own subdomain |
| `path` | `/my-product` | Requested path |
| `query` | `URLSearchParams` | URL parameters |
| `url` | `URL` | Full URL |
| `isBot` | `true` | The request comes from a crawler (WhatsApp, Facebook, Google…) |
| `req` | | Original request (Express, Node…) |

### SEO data

| Field | Generated tags |
|---|---|
| `title` | `<title>`, `og:title`, `twitter:title` |
| `description` | `description`, `og:description`, `twitter:description`. HTML is converted to plain text and truncated to 200 characters |
| `image`, `imageAlt`, `imageWidth`, `imageHeight` | `og:image…`, `twitter:image` |
| `url` | `og:url`. Defaults to the requested URL without query string |
| `canonical` | `<link rel="canonical">`. Defaults to `url`, `false` to disable it |
| `type` | `og:type`. Defaults to `website` |
| `siteName`, `locale` | `og:site_name`, `og:locale` |
| `twitterCard`, `twitterSite` | `twitter:card` (`summary_large_image` when there is an image), `twitter:site` |
| `favicon` | `<link rel="icon">` |
| `robots` | `robots`, for example `noindex` |
| `meta`, `links` | Additional tags, for example `{ property: 'product:price:amount', content: '15000' }` |
| `jsonLd` | schema.org structured data |
| `status` | HTTP status of the response, for example `404` for a missing product. Not rendered |

## Options

| Option | Default | Description |
|---|---|---|
| `template` | required | `index.html`, or a function returning it |
| `resolve` | required | Returns the SEO data of the page |
| `defaults` | `{}` | Default values, or a function receiving the context |
| `timeout` | `3000` | Maximum time given to the resolver (ms). Beyond it, the default values are used |
| `cache` | disabled | `{ ttl, max }`: in-memory cache per origin and URL. Failures are not cached |
| `botsOnly` | `false` | Only calls the resolver for crawlers: visitors get the default values, without any API call |
| `trustProxy` | `true` | Reads `X-Forwarded-Proto` and `X-Forwarded-Host` from the proxy |
| `descriptionMaxLength` | `200` | Maximum length of the description, `0` to disable truncation |
| `placeholder` | `<!--seo-head-->` | Location of the tags in the template |
| `replaceExisting` | `true` | Removes the template tags redefined by the page |
| `transformHtml` | | Transforms the template before the injection (Vite in development) |
| `shouldHandle` | HTML pages | Filters the requests handled by the middleware |
| `cacheControl` | `no-cache` | `Cache-Control` header of the page, `false` to leave it unset |
| `onError` | | Called when the resolver fails or times out |

## Without Express

The core functions can be used on their own, for example in another server or in an existing SSR setup:

```js
const { createSeoRenderer, buildSeoTags, renderSeoTags, injectSeoTags } = require('spa-meta-tags')

// Full rendering of a request
const renderer = createSeoRenderer({ resolve, defaults, cache: { ttl: 60_000 } })
const { html, status } = await renderer.render(req, template)

// Or just the tags
const tags = buildSeoTags({ title: 'My page', image: 'https://…' })
const head_html = renderSeoTags(tags)
const page = injectSeoTags(template, tags)
```

Exported utilities: `isBot`, `getRequestOrigin`, `htmlToText`, `truncate`, `escapeHtml`, `mergeSeo`.

## In production

- **The reverse proxy** (Nginx, Traefik, Cloudflare, your host's router…) must forward the real domain (`Host` or `X-Forwarded-Host`) and the protocol (`X-Forwarded-Proto: https`). Otherwise the generated URLs are wrong, and an API identifying the customer by its domain will not find it.
- **Images** must be publicly reachable, with absolute URLs. Prefer JPEG or PNG, at least 600 × 315 px: WebP is not displayed by every platform.
- **Add a `robots.txt`** to your static files. Without it, `/robots.txt` may receive the HTML page, and the Facebook crawler then refuses to read the site.
- **Previews are cached by social networks.** To test them, use the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) ("Scrape Again" button).

## Development

```bash
npm install
npm test           # tests
npm run type-check
npm run build      # dist/ (ESM + CommonJS + types)
```

To publish a version: update `version` in `package.json`, then run `npm publish`. Tests, type checking and the build run automatically before publishing.

## Contributing

Contributions are welcome: bugs, ideas, documentation or code. See the [contributing guide](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Roméo AZAGBA
