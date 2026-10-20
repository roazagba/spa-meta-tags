# Development with Vite

In development, Vite serves the app with hot reload. To see the tags locally, run Vite in middleware mode inside your server, and let the package serve the pages.

```js
// server.js
import fs from 'node:fs'
import express from 'express'
import { createSeoMiddleware } from 'spa-meta-tags'

const isProduction = process.env.NODE_ENV === 'production'
const app = express()

let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  app.use(vite.middlewares)
} else {
  app.use(express.static('dist', { index: false }))
}

app.use(createSeoMiddleware({
  // Development: read index.html on each request, so that changes are taken into account
  template: isProduction
    ? fs.readFileSync('dist/index.html', 'utf8')
    : () => fs.promises.readFile('index.html', 'utf8'),

  // Development: let Vite add its client script and transform the page
  transformHtml: vite
    ? (html, req) => vite.transformIndexHtml(req.originalUrl, html)
    : undefined,

  resolve,
  defaults,
}))

app.listen(3000)
```

Key points:

- `appType: 'custom'`: Vite does not serve `index.html` itself, the package does.
- `template` as a **function** in development: the file is read again on each request.
- `transformHtml`: called before the injection. `vite.transformIndexHtml` adds the Vite client and applies the HTML plugins.

## Opening the dev server through a tunnel

To test previews from your machine with ngrok or Cloudflare Tunnel, allow the domain of the tunnel in Vite, otherwise Vite answers "Blocked request. This host is not allowed":

```js
vite = await createServer({
  server: { middlewareMode: true, allowedHosts: ['.ngrok-free.app'] },
  appType: 'custom',
})
```

See [Testing link previews](./testing-previews).
