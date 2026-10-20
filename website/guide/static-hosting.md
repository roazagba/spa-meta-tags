# Static hosting

If your SPA is deployed as static files, on any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, shared hosting, S3, and so on), there is no Node server to run the middleware. Generate the pages at build time instead.

## The idea

After `vite build`, write one copy of `index.html` per page, each with its own tags:

```
dist/index.html            ->  https://example.com/
dist/about/index.html      ->  https://example.com/about/
dist/blog/first-post/      ->  https://example.com/blog/first-post/
```

Static hosts serve these files as is. Crawlers get the right tags, and the SPA still boots normally in the browser.

This works for pages known at build time: routes of the app, articles of a blog, projects of a portfolio. For pages created at any time (products of a store, user profiles), you need a Node server and the [middleware](./express).

## The Vite plugin

The repository contains a ready-to-copy plugin: [`examples/vite-static-pages.js`](https://github.com/roazagba/spa-meta-tags/blob/main/examples/vite-static-pages.js). Copy it to your project, for example to `plugins/static-meta-pages.js`.

It reads the pages from your **routes file**. Put the SEO data of each page in its route:

```js
// src/router/routes.js
import Home from '../pages/Home.vue'

export const routes = [
  { path: '/', component: Home, meta: { seo: { title: 'My Site', description: 'Welcome to my site' } } },
  { path: '/about', component: () => import('../pages/About.vue'), meta: { seo: { title: 'About | My Site' } } },
  {
    path: '/blog',
    children: [
      { path: 'first-post', component: () => import('../pages/Post.vue'), meta: { seo: { title: 'First post', type: 'article' } } },
    ],
  },
  { path: '/projects/:id', component: () => import('../pages/Project.vue') },
]
```

```js
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes.js'

export default createRouter({ history: createWebHistory(), routes })
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { staticMetaPages } from './plugins/static-meta-pages.js'

export default defineConfig({
  plugins: [
    vue(),
    staticMetaPages({
      siteUrl: 'https://example.com',
      routes: './src/router/routes.js',
      defaults: { siteName: 'My Site', image: 'https://example.com/og-image.jpg', locale: 'en_US' },
    }),
  ],
})
```

Run `vite build`: the plugin logs `meta tags generated for N pages`.

The routes file is loaded with Vite, so it can import `.vue`, `.jsx` or `.tsx` components, statically or lazily. Keep the routes in their own file (not in the file that calls `createRouter`), so that loading them does not start the router.

### What is generated

- One page per route that has SEO data, nested routes (`children`) included.
- Routes without SEO data, dynamic routes (`/projects/:id`) and catch-all routes are skipped. They keep working through your usual SPA fallback, with the default tags of `index.html`.

### Plugin options

| Option | Description |
|---|---|
| `siteUrl` | Absolute URL of the site, without trailing slash. Required |
| `routes` | Routes file, relative to the project root |
| `routesExport` | Export holding the routes. Defaults to `routes`, then `default` |
| `getSeo` | Function reading the SEO data of a route. Defaults to `route.meta.seo` (Vue Router), then `route.handle.seo` (React Router) |
| `pages` | Function returning more pages, as `[{ path, seo }]` |
| `defaults` | Data shared by every page |

### Pages built from data

When the pages come from data (an API, JSON or markdown files), use `pages`. It can be used alone or with `routes`:

```js
staticMetaPages({
  siteUrl: 'https://example.com',
  pages: async () => {
    const posts = await fetch('https://api.example.com/posts').then(r => r.json())
    return posts.map(post => ({
      path: `/blog/${post.slug}`,
      seo: { title: post.title, description: post.excerpt, image: post.cover_url, type: 'article' },
    }))
  },
})
```

## Two things to check

### The trailing slash

`/about` is now a folder, so most static hosts redirect it to `/about/`. The plugin uses this final URL for `og:url` and the canonical link. Vue Router and React Router match `/about/` like `/about` by default, so the app works with both.

### Relative paths

From `/about/`, the browser resolves a relative path such as `data/content.json` or `images/logo.png` to `/about/data/content.json`, and the request fails. The page then loads but shows no data, with errors like `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.

If your app uses relative paths (in `fetch`, `<img src>`, JSON files), add a base URL at the top of the `<head>` of `index.html`:

```html
<head>
  <meta charset="UTF-8" />
  <base href="%BASE_URL%" />
  <!-- ... -->
</head>
```

Vite replaces `%BASE_URL%` with your `base` option (`/` by default), and every relative path is then resolved from the root of the site.

::: warning
`<base>` also changes the target of links like `href="#section"`, which then point to the home page. Use the full path (`href="/about#section"`) or a router link for them.
:::

## Deploying

Upload the whole `dist/` folder as usual, including the new folders (`about/`, `blog/`, etc.).

Some hosts need a fallback for the pages that are not generated (dynamic routes): keep your current setting (a `404.html` copy of `index.html`, a `_redirects` file, a rewrite rule).
