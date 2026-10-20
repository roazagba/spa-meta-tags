# Node http et autres serveurs

## Node `http`

Le middleware fonctionne sans Express. Appelé sans `next`, il répond `404` aux requêtes qu'il ne traite pas, et `500` quand une erreur survient en dehors du resolver.

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

Dans un vrai serveur, servez vos fichiers statiques avant d'appeler le middleware.

## Connect et autres serveurs compatibles

Tout serveur dont les requêtes ont `url`, `headers` et `method`, et les réponses `statusCode`, `setHeader()` et `end()`, fonctionne tel quel. C'est le cas de Connect, Polka et des middlewares du serveur de développement de Vite.

```js
const connect = require('connect')
const serveStatic = require('serve-static')

const app = connect()
app.use(serveStatic('dist', { index: false }))
app.use(createSeoMiddleware({ /* ... */ }))
```

## Fastify, Hono, Koa et les autres

Pour les serveurs qui ont une autre API de requête et de réponse, utilisez directement le renderer. Il fait le même travail que le middleware, sans envoyer la réponse :

```js
import { createSeoRenderer } from 'spa-meta-tags'

const renderer = createSeoRenderer({ resolve, defaults })

// Dans votre gestionnaire de route :
const { html, status } = await renderer.render(request, template)
```

`render(req, html)` a besoin d'un objet requête avec `url` (ou `originalUrl`) et `headers`. Avec Fastify, passez la requête Node d'origine :

```js
fastify.get('/*', async (request, reply) => {
  const { html, status } = await renderer.render(request.raw, template)
  reply.code(status).type('text/html; charset=utf-8').send(html)
})
```

Avec un serveur basé sur l'API Web `Request` (Hono, Bun, Deno), construisez un petit objet :

```js
const { html, status } = await renderer.render({
  url: new URL(request.url).pathname + new URL(request.url).search,
  headers: Object.fromEntries(request.headers),
}, template)
```

## Dans un rendu SSR existant

Si vous rendez déjà l'application côté serveur et n'avez besoin que des balises, appelez les fonctions de plus bas niveau :

```js
import { buildSeoTags, renderSeoTags, injectSeoTags } from 'spa-meta-tags'

const tags = buildSeoTags({ title: 'My page', description: '...', image: '...' })

const headHtml = renderSeoTags(tags)        // texte des balises, à placer vous-même
const page = injectSeoTags(template, tags)  // ou injectées dans une page HTML complète
```

Voir [Fonctions](../reference/functions).
