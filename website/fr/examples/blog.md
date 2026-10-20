# Blog avec une API

Un blog Vue ou React servi par Express. Les articles viennent d'un CMS sans interface publique (Strapi, Directus, l'API REST de WordPress, etc.), à l'adresse `/blog/:slug`.

```js
// server.js
import fs from 'node:fs'
import express from 'express'
import { createSeoMiddleware } from 'spa-meta-tags'

const CMS = 'https://cms.example.com/api'
const SITE = 'https://blog.example.com'

const app = express()
app.use(express.static('dist', { index: false }))

app.use(createSeoMiddleware({
  template: fs.readFileSync('dist/index.html', 'utf8'),
  cache: { ttl: 10 * 60 * 1000 },

  defaults: {
    title: 'The Example Blog',
    siteName: 'The Example Blog',
    description: 'Articles about web development',
    image: `${SITE}/og-image.png`,
    locale: 'en_US',
    twitterSite: '@exampleblog',
  },

  async resolve ({ path }) {
    const match = path.match(/^\/blog\/([^/]+)$/)
    if (!match) return null

    const response = await fetch(`${CMS}/posts?slug=${encodeURIComponent(match[1])}`)
    const [post] = response.ok ? await response.json() : []
    if (!post) return { title: 'Article not found', robots: 'noindex', status: 404 }

    return {
      title: `${post.title} | The Example Blog`,
      description: post.excerpt || post.content,
      image: post.cover?.url,
      imageAlt: post.cover?.alt,
      type: 'article',
      meta: [
        { property: 'article:published_time', content: post.published_at },
        { property: 'article:author', content: post.author.name },
        ...post.tags.map(tag => ({ property: 'article:tag', content: tag })),
      ],
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': post.title,
        'image': post.cover?.url,
        'datePublished': post.published_at,
        'author': { '@type': 'Person', 'name': post.author.name },
      },
    }
  },
}))

app.listen(3000)
```

Remarques :

- `description: post.excerpt || post.content` : le contenu peut être le HTML complet de l'article, le package le convertit en texte et garde les 200 premiers caractères.
- Plusieurs balises `article:tag` sont possibles : les balises `meta` supplémentaires sont écrites telles quelles, une par élément.
- Un article introuvable renvoie `404` avec `noindex` : les moteurs de recherche retirent l'adresse.

Si le blog est hébergé en fichiers statiques, générez plutôt les pages des articles au moment du build : voir [Hébergement statique](../guide/static-hosting#pages-built-from-data).
