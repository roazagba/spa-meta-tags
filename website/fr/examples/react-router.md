# React Router

## Avec un serveur Node

Le middleware ne dépend pas du framework de la SPA : l'installation pour une application React est la même que pour Vue. Voir [Express](../guide/express).

## En hébergement statique

Avec React Router, mettez les données SEO de chaque route dans `handle`, que React Router réserve à vos propres données :

```jsx
// src/routes.jsx
import Home from './pages/Home'
import About from './pages/About'
import Post from './pages/Post'

export const routes = [
  { path: '/', element: <Home />, handle: { seo: { title: 'My Site', description: 'Welcome to my site' } } },
  { path: '/about', element: <About />, handle: { seo: { title: 'About | My Site' } } },
  {
    path: '/blog',
    children: [
      { path: 'first-post', element: <Post />, handle: { seo: { title: 'First post', type: 'article' } } },
    ],
  },
]
```

```jsx
// src/main.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routes } from './routes'

const router = createBrowserRouter(routes)
// ...
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { staticMetaPages } from './plugins/static-meta-pages.js'

export default defineConfig({
  plugins: [
    react(),
    staticMetaPages({
      siteUrl: 'https://example.com',
      routes: './src/routes.jsx',
      defaults: { siteName: 'My Site', image: 'https://example.com/og-image.jpg' },
    }),
  ],
})
```

Le plugin lit `route.handle.seo` par défaut. Pour lire un autre champ, passez `getSeo` :

```js
staticMetaPages({
  siteUrl: 'https://example.com',
  routes: './src/routes.jsx',
  getSeo: route => route.handle?.meta,
})
```

Le plugin est [`examples/vite-static-pages.js`](https://github.com/roazagba/spa-meta-tags/blob/main/examples/vite-static-pages.js), voir [Hébergement statique](../guide/static-hosting).
