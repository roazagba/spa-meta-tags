# Node http and other servers

## Node `http`

The middleware works without Express. Called without `next`, it answers `404` for the requests it does not handle, and `500` when an error happens outside the resolver.

```js
import fs from 'node:fs'
import http from 'node:http'
import { createSeoMiddleware } from 'spa-meta-tags'

const seo = createSeoMiddleware({
  template: fs.readFileSync('dist/index.html', 'utf8'),
  resolve: ({ path }) => ({ title: `Page ${path}` }),
})

http.createServer((req, res) => seo(req, res)).listen(3000)
```

In a real server, serve your static files before calling the middleware.

## Connect and other compatible servers

Any server where requests have `url`, `headers` and `method`, and responses have `statusCode`, `setHeader()` and `end()`, works as is. This includes Connect, Polka and the Vite dev server middlewares.

```js
const connect = require('connect')
const serveStatic = require('serve-static')

const app = connect()
app.use(serveStatic('dist', { index: false }))
app.use(createSeoMiddleware({ /* ... */ }))
```

## Fastify, Hono, Koa and others

For servers with a different request and response API, use the renderer directly. It does the same work as the middleware, without sending the response:

```js
import { createSeoRenderer } from 'spa-meta-tags'

const renderer = createSeoRenderer({ resolve, defaults })

// Inside your route handler:
const { html, status } = await renderer.render(request, template)
```

`render(req, html)` needs a request object with `url` (or `originalUrl`) and `headers`. With Fastify, pass the raw Node request:

```js
fastify.get('/*', async (request, reply) => {
  const { html, status } = await renderer.render(request.raw, template)
  reply.code(status).type('text/html; charset=utf-8').send(html)
})
```

With a server based on the Web `Request` API (Hono, Bun, Deno), build a small object:

```js
const { html, status } = await renderer.render({
  url: new URL(request.url).pathname + new URL(request.url).search,
  headers: Object.fromEntries(request.headers),
}, template)
```

## In an existing SSR setup

If you already render the app on the server and only need the tags, call the lower level functions:

```js
import { buildSeoTags, renderSeoTags, injectSeoTags } from 'spa-meta-tags'

const tags = buildSeoTags({ title: 'My page', description: '...', image: '...' })

const headHtml = renderSeoTags(tags)        // string of tags, to place yourself
const page = injectSeoTags(template, tags)  // or injected in a full HTML page
```

See [Functions](../reference/functions).
