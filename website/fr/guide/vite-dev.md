# Développement avec Vite

En développement, Vite sert l'application avec le rechargement à chaud. Pour voir les balises en local, lancez Vite en mode middleware dans votre serveur, et laissez le package servir les pages.

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
  // Développement : relire index.html à chaque requête, pour prendre en compte les modifications
  template: isProduction
    ? fs.readFileSync('dist/index.html', 'utf8')
    : () => fs.promises.readFile('index.html', 'utf8'),

  // Développement : laisser Vite ajouter son script client et transformer la page
  transformHtml: vite
    ? (html, req) => vite.transformIndexHtml(req.originalUrl, html)
    : undefined,

  resolve,
  defaults,
}))

app.listen(3000)
```

Points importants :

- `appType: 'custom'` : Vite ne sert pas `index.html` lui-même, c'est le package qui le fait.
- `template` sous forme de **fonction** en développement : le fichier est relu à chaque requête.
- `transformHtml` : appelée avant l'injection. `vite.transformIndexHtml` ajoute le client Vite et applique les plugins HTML.

## Ouvrir le serveur de développement par un tunnel {#opening-the-dev-server-through-a-tunnel}

Pour tester les aperçus depuis votre machine avec ngrok ou Cloudflare Tunnel, autorisez le domaine du tunnel dans Vite. Sinon, Vite répond "Blocked request. This host is not allowed" :

```js
vite = await createServer({
  server: { middlewareMode: true, allowedHosts: ['.ngrok-free.app'] },
  appType: 'custom',
})
```

Voir [Tester les aperçus](./testing-previews).
