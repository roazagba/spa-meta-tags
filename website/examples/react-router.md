# React Router

## With a Node server

The middleware does not depend on the framework of the SPA: the setup of a React app is the same as for Vue. See [Express](../guide/express).

## On static hosting

With React Router, put the SEO data of each route in `handle`, which React Router keeps for your own data:

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

The plugin reads `route.handle.seo` by default. To read another field, pass `getSeo`:

```js
staticMetaPages({
  siteUrl: 'https://example.com',
  routes: './src/routes.jsx',
  getSeo: route => route.handle?.meta,
})
```

The plugin is [`examples/vite-static-pages.js`](https://github.com/roazagba/spa-meta-tags/blob/main/examples/vite-static-pages.js), see [Static hosting](../guide/static-hosting).
