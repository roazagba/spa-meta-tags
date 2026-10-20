# Express

## Serveur de production

```js
// server.cjs
const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const { createSeoMiddleware } = require('spa-meta-tags')

const dist = path.resolve(__dirname, 'dist')
const app = express()

// Vos routes d'API, si le même serveur en a
app.use('/api', require('./api'))

// Fichiers statiques, sans index.html
app.use(express.static(dist, { index: false }))

// Toutes les pages
app.use(createSeoMiddleware({
  template: fs.readFileSync(path.join(dist, 'index.html'), 'utf8'),
  defaults: { title: 'My Site', siteName: 'My Site' },
  resolve: async ({ path }) => {
    // ...
  },
}))

app.listen(process.env.PORT || 3000)
```

L'ordre compte :

1. **Les routes d'API et les fichiers statiques d'abord.** Le middleware traite toutes les requêtes de pages : ce qui est placé après lui n'est jamais atteint pour les pages.
2. **`express.static` avec `{ index: false }`.** Sinon, Express envoie `dist/index.html` pour `/` sans les balises.

Le template est lu une seule fois, au démarrage : en production, `index.html` ne change pas pendant que le serveur tourne.

## Derrière un proxy

La plupart des serveurs de production sont derrière un proxy (Nginx, Traefik, Caddy, un répartiteur de charge, le routeur de votre hébergeur). Par défaut, le package lit `X-Forwarded-Proto` et `X-Forwarded-Host` (`trustProxy: true`) pour connaître la vraie URL du visiteur. Voir [Liste de contrôle](./production#reverse-proxy).

C'est indépendant du réglage `trust proxy` d'Express : inutile de le modifier.

## Monter le middleware sur un sous-chemin

```js
app.use('/shop', createSeoMiddleware({ /* ... */ }))
```

Le resolver reçoit le chemin complet (`/shop/barca-2026-jersey`) : le package lit `req.originalUrl`, qui garde le préfixe.

## Gérer les erreurs

Les erreurs qui ne viennent pas du resolver (par exemple une fonction `template` qui n'arrive pas à lire son fichier) sont passées à `next(error)` : votre gestionnaire d'erreurs Express les reçoit.

```js
app.use((error, req, res, next) => {
  console.error(error)
  res.status(500).send('Server error')
})
```

Les erreurs **du resolver** n'arrivent jamais au gestionnaire d'erreurs : la page est servie avec les valeurs par défaut, et l'option [`onError`](../reference/options#onerror) est appelée.

## Vider le cache

Quand le [cache](./performance) est activé, le renderer est disponible sur le middleware :

```js
const seo = createSeoMiddleware({ /* ..., */ cache: { ttl: 10 * 60 * 1000 } })
app.use(seo)

// Par exemple après la mise à jour d'un produit
app.post('/admin/cache/clear', (req, res) => {
  seo.renderer.clearCache()
  res.sendStatus(204)
})
```
