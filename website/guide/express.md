# Express

## Production server

```js
// server.cjs
const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const { createSeoMiddleware } = require('spa-meta-tags')

const dist = path.resolve(__dirname, 'dist')
const app = express()

// Your API routes, if the same server has some
app.use('/api', require('./api'))

// Static files, without index.html
app.use(express.static(dist, { index: false }))

// Every page
app.use(createSeoMiddleware({
  template: fs.readFileSync(path.join(dist, 'index.html'), 'utf8'),
  defaults: { title: 'My Site', siteName: 'My Site' },
  resolve: async ({ path }) => {
    // ...
  },
}))

app.listen(process.env.PORT || 3000)
```

Order matters:

1. **API routes and static files first.** The middleware handles every page request; anything placed after it is never reached for pages.
2. **`express.static` with `{ index: false }`.** Otherwise Express sends `dist/index.html` for `/` without the tags.

The template is read once, at startup: in production, `index.html` does not change while the server runs.

## Behind a reverse proxy

Most production servers run behind a reverse proxy (Nginx, Traefik, Caddy, a load balancer, the router of your host). The package reads `X-Forwarded-Proto` and `X-Forwarded-Host` by default (`trustProxy: true`) to know the real URL of the visitor. See [Production checklist](./production#reverse-proxy).

This is independent from the `trust proxy` setting of Express: you do not need to change it.

## Mounting on a sub path

```js
app.use('/shop', createSeoMiddleware({ /* ... */ }))
```

The resolver receives the full path (`/shop/barca-2026-jersey`): the package reads `req.originalUrl`, which keeps the mount path.

## Handling errors

Errors that do not come from the resolver (for example a template function that cannot read its file) are passed to `next(error)`, so your Express error handler receives them:

```js
app.use((error, req, res, next) => {
  console.error(error)
  res.status(500).send('Server error')
})
```

Errors **inside the resolver** never reach the error handler: the page is served with the defaults, and the [`onError`](../reference/options#onerror) option is called.

## Clearing the cache

When the [cache](./performance) is enabled, the renderer is available on the middleware:

```js
const seo = createSeoMiddleware({ /* ..., */ cache: { ttl: 10 * 60 * 1000 } })
app.use(seo)

// For example after a product update
app.post('/admin/cache/clear', (req, res) => {
  seo.renderer.clearCache()
  res.sendStatus(204)
})
```
