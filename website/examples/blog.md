# Blog with an API

A Vue or React blog served by Express. Articles come from a headless CMS (Strapi, Directus, WordPress REST API, etc.), at `/blog/:slug`.

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

Notes:

- `description: post.excerpt || post.content`: the content can be the full HTML of the article, the package converts it to text and keeps the first 200 characters.
- Several `article:tag` tags are allowed: extra `meta` tags are rendered as given, one per item.
- A missing article returns `404` with `noindex`, so search engines drop the URL.

If the blog is hosted as static files, generate the article pages at build time instead: see [Static hosting](../guide/static-hosting#pages-built-from-data).
