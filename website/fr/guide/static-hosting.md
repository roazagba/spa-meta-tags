# Hébergement statique

Si votre SPA est déployée en fichiers statiques (GitHub Pages, Netlify, Vercel en statique, Cloudflare Pages, Hostinger, S3, etc.), il n'y a pas de serveur Node pour faire tourner le middleware. Générez plutôt les pages au moment du build.

## Le principe

Après `vite build`, on écrit une copie de `index.html` par page, chacune avec ses propres balises :

```
dist/index.html            ->  https://example.com/
dist/about/index.html      ->  https://example.com/about/
dist/blog/first-post/      ->  https://example.com/blog/first-post/
```

Les hébergeurs statiques servent ces fichiers tels quels. Les robots reçoivent les bonnes balises, et la SPA démarre normalement dans le navigateur.

Ça fonctionne pour les pages connues au moment du build : les routes de l'application, les articles d'un blog, les projets d'un portfolio. Pour des pages créées à tout moment (produits d'une boutique, profils d'utilisateurs), il faut un serveur Node et le [middleware](./express).

## Le plugin Vite

Le dépôt contient un plugin prêt à copier : [`examples/vite-static-pages.js`](https://github.com/roazagba/spa-meta-tags/blob/main/examples/vite-static-pages.js). Copiez-le dans votre projet, par exemple dans `plugins/static-meta-pages.js`.

Il lit les pages dans votre **fichier de routes**. Mettez les données SEO de chaque page dans sa route :

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

Lancez `vite build` : le plugin affiche `meta tags generated for N pages`.

Le fichier de routes est chargé avec Vite : il peut donc importer des composants `.vue`, `.jsx` ou `.tsx`, directement ou en chargement différé. Gardez les routes dans leur propre fichier (pas dans celui qui appelle `createRouter`), pour que leur chargement ne démarre pas le routeur.

### Ce qui est généré

- Une page par route qui a des données SEO, routes imbriquées (`children`) comprises.
- Les routes sans données SEO, les routes dynamiques (`/projects/:id`) et les routes "attrape-tout" sont ignorées. Elles continuent de fonctionner grâce à votre mécanisme habituel de SPA, avec les balises par défaut de `index.html`.

### Options du plugin

| Option | Description |
|---|---|
| `siteUrl` | Adresse complète du site, sans slash final. Obligatoire |
| `routes` | Fichier de routes, relatif à la racine du projet |
| `routesExport` | Export qui contient les routes. Par défaut `routes`, puis `default` |
| `getSeo` | Fonction qui lit les données SEO d'une route. Par défaut `route.meta.seo` (Vue Router), puis `route.handle.seo` (React Router) |
| `pages` | Fonction qui renvoie des pages supplémentaires, sous la forme `[{ path, seo }]` |
| `defaults` | Données communes à toutes les pages |

### Pages construites à partir de données {#pages-built-from-data}

Quand les pages viennent de données (une API, des fichiers JSON ou Markdown), utilisez `pages`. L'option s'utilise seule ou avec `routes` :

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

## Deux points à vérifier

### Le slash final

`/about` est maintenant un dossier : la plupart des hébergeurs statiques redirigent donc vers `/about/`. Le plugin utilise cette URL finale pour `og:url` et le lien canonique. Vue Router et React Router acceptent `/about/` comme `/about` par défaut : l'application fonctionne avec les deux.

### Les chemins relatifs {#relative-paths}

Depuis `/about/`, le navigateur cherche un chemin relatif comme `data/content.json` ou `images/logo.png` dans `/about/data/content.json`, et la requête échoue. La page se charge alors sans aucune donnée, avec des erreurs comme `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.

Si votre application utilise des chemins relatifs (dans `fetch`, `<img src>`, des fichiers JSON), ajoutez une adresse de base en haut du `<head>` de `index.html` :

```html
<head>
  <meta charset="UTF-8" />
  <base href="%BASE_URL%" />
  <!-- ... -->
</head>
```

Vite remplace `%BASE_URL%` par votre option `base` (`/` par défaut), et tous les chemins relatifs partent alors de la racine du site.

::: warning
`<base>` change aussi la cible des liens comme `href="#section"`, qui pointent alors vers la page d'accueil. Utilisez le chemin complet (`href="/about#section"`) ou un lien du routeur pour ceux-là.
:::

## Déployer

Envoyez tout le dossier `dist/` comme d'habitude, y compris les nouveaux dossiers (`about/`, `blog/`, etc.).

Certains hébergeurs ont besoin d'une solution de repli pour les pages qui ne sont pas générées (routes dynamiques) : gardez votre réglage actuel (une copie `404.html` de `index.html`, un fichier `_redirects`, une règle de réécriture).
