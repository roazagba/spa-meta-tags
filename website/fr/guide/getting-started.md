# Premiers pas

## Prérequis

- Node.js 18 ou plus récent.
- Une SPA servie par un serveur Node (Express ou autre). Pour un hébergement statique sans serveur Node, voir [Hébergement statique](./static-hosting).

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

Le package fonctionne avec `import` comme avec `require` :

```js
// Modules ES
import { createSeoMiddleware } from 'spa-meta-tags'

// CommonJS (server.cjs)
const { createSeoMiddleware } = require('spa-meta-tags')
```

## Un premier serveur

Ce serveur sert le build d'une application Vite (`dist/`) et donne à chaque page produit son propre aperçu.

```js
// server.cjs
const fs = require('node:fs')
const express = require('express')
const { createSeoMiddleware } = require('spa-meta-tags')

const app = express()

// 1. Fichiers statiques du build (JS, CSS, images), sans index.html
app.use(express.static('dist', { index: false }))

// 2. Toutes les pages : index.html avec les balises de la page
app.use(createSeoMiddleware({
  template: fs.readFileSync('dist/index.html', 'utf8'),

  // Utilisées pour toutes les pages, et quand le resolver ne renvoie rien
  defaults: {
    title: 'My Store',
    siteName: 'My Store',
    description: 'Jerseys and sportswear',
    image: 'https://shop.example.com/og-image.jpg',
  },

  // Renvoie les données SEO de la page demandée
  async resolve ({ path }) {
    const slug = path.slice(1)
    if (!slug) return null // page d'accueil : valeurs par défaut

    const response = await fetch(`https://api.example.com/products/${slug}`)
    if (!response.ok) return null

    const product = await response.json()

    return {
      title: `${product.name} | My Store`,
      description: product.description, // le HTML est converti en texte
      image: product.image_url,
      type: 'product',
    }
  },
}))

app.listen(3000)
```

Lancez-le et regardez le HTML que reçoit un robot :

```bash
node server.cjs
curl -s -A "facebookexternalhit/1.1" http://localhost:3000/barca-2026-jersey | grep -E "<title>|og:"
```

Vous devez voir le titre, la description et l'image du produit.

::: tip Deux détails importants
- `express.static('dist', { index: false })` : sans `index: false`, Express servirait directement `dist/index.html` pour `/`, sans les balises.
- Le middleware doit venir **après** les fichiers statiques : il traite toutes les requêtes de pages et remplace le "renvoyer index.html pour toutes les routes" habituel des SPA.
:::

## Si l'API est en panne

Si le resolver lance une erreur, ou met plus de 3 secondes, la page est quand même servie avec les `defaults`. Les visiteurs n'attendent jamais une API en panne. Voir [Le resolver](./resolver#errors-and-timeouts).

## Pour aller plus loin

- [Fonctionnement](./how-it-works) : ce que fait le middleware de chaque requête.
- [Le resolver](./resolver) : tout ce que le resolver reçoit et peut renvoyer.
- [Liste de contrôle](./production) : en-têtes du proxy, images, `robots.txt`.
- [Tester les aperçus](./testing-previews) : vérifier le résultat sur Facebook, WhatsApp et LinkedIn.
