# Le resolver

Le resolver est la fonction que vous écrivez pour décrire chaque page. Il reçoit le contexte de la requête et renvoie ses données SEO.

```js
async function resolve (context) {
  // context.path, context.host, context.query, etc.
  return { title, description, image }
}
```

## Ce qu'il reçoit {#what-it-receives}

| Champ | Type | Exemple | Description |
|---|---|---|---|
| `path` | `string` | `/products/42` | Chemin demandé, sans paramètres |
| `query` | `URLSearchParams` | `query.get('ref')` | Paramètres de l'URL |
| `url` | `URL` | `url.href` | URL complète de la requête |
| `origin` | `string` | `https://shop.example.com` | Protocole et domaine du visiteur, derrière le proxy |
| `host` | `string` | `shop.example.com` | Domaine du visiteur (avec le port, s'il y en a un) |
| `isBot` | `boolean` | `true` | La requête vient d'un robot (WhatsApp, Facebook, Google, etc.) |
| `req` | objet | | La requête d'origine (Express, Node `http`) |

## Ce qu'il peut renvoyer

- Un objet de [données SEO](../reference/seo-data) : tous les champs sont facultatifs.
- `null` ou `undefined` : les [valeurs par défaut](../reference/options#defaults) sont utilisées.
- Une promesse de l'un des deux : le resolver peut être `async`.

```js
resolve: async ({ path }) => {
  const product = await getProduct(path.slice(1))
  if (!product) return { title: 'Product not found', robots: 'noindex', status: 404 }

  return {
    title: `${product.name} | My Store`,
    description: product.description,
    image: product.images[0]?.url,
    type: 'product',
    meta: [
      { property: 'product:price:amount', content: String(product.price) },
      { property: 'product:price:currency', content: product.currency },
    ],
  }
}
```

### La description

Vous pouvez renvoyer le HTML d'un éditeur de texte riche : le package retire les balises (et le contenu des `<script>` et `<style>`), décode les entités (`&eacute;`, `&#39;`, etc.) et coupe le texte à 200 caractères, avec des points de suspension. Changez la longueur avec [`descriptionMaxLength`](../reference/options#descriptionmaxlength).

### Les URL doivent être complètes

`image`, `url`, `canonical` et `favicon` sont utilisés tels quels : les robots ont besoin d'URL complètes (`https://...`). Si votre API renvoie des chemins, construisez l'URL :

```js
image: product.image_path ? `https://cdn.example.com/${product.image_path}` : undefined
```

`url` reprend par défaut l'URL demandée, sans paramètres : vous avez rarement besoin de la renseigner.

### Le code HTTP

Renvoyez `status` pour changer le code HTTP de la page, par exemple `404` pour un produit introuvable. Le code n'est pas affiché comme une balise. Les robots et les moteurs de recherche savent alors que la page n'existe pas, et avec `robots: 'noindex'`, elle n'est pas indexée.

## Les valeurs par défaut

Les `defaults` sont fusionnées sous les données du resolver. Utilisez-les pour ce qui est commun à toutes les pages :

```js
defaults: {
  siteName: 'My Store',
  locale: 'en_US',
  title: 'My Store',
  description: 'Jerseys and sportswear',
  image: 'https://shop.example.com/og-image.jpg',
  twitterSite: '@mystore',
}
```

`defaults` peut aussi être une fonction du contexte, par exemple pour construire les URL à partir du domaine du visiteur :

```js
defaults: ({ origin }) => ({
  image: `${origin}/og-image.jpg`,
  favicon: `${origin}/favicon.png`,
})
```

Une valeur `undefined` dans les données du resolver ne remplace pas la valeur par défaut. Les tableaux (`meta`, `links`, `jsonLd`) sont remplacés, pas fusionnés avec ceux des valeurs par défaut.

## Erreurs et délais {#errors-and-timeouts}

Le resolver est protégé :

- s'il **lance une erreur** ou renvoie une promesse rejetée, la page est servie avec les valeurs par défaut ;
- s'il met plus de **3 secondes** (option [`timeout`](../reference/options#timeout)), la page est servie avec les valeurs par défaut, sans attendre.

Dans les deux cas, [`onError`](../reference/options#onerror) est appelée, pour que vous puissiez enregistrer le problème :

```js
onError: (error, { url }) => console.error(`[seo] ${url.href}`, error)
```

Les échecs ne sont pas mis en cache : la requête suivante rappelle le resolver.

::: warning
Après un délai dépassé, votre resolver continue de tourner en arrière-plan (par exemple un `fetch` qui ne répond jamais). Mettez aussi un délai sur vos propres requêtes, par exemple `fetch(url, { signal: AbortSignal.timeout(2500) })`.
:::

## Seulement pour les robots

Par défaut, le resolver est appelé pour chaque requête de page, y compris les vrais visiteurs. Pour économiser des appels d'API, ne l'appelez que pour les robots avec [`botsOnly`](../reference/options#botsonly) : les visiteurs reçoivent alors les valeurs par défaut, qu'ils ne voient de toute façon pas (la SPA met la page à jour).

```js
createSeoMiddleware({ template, resolve, defaults, botsOnly: true })
```

La détection se fait sur le user agent. Les moteurs de recherche sont aussi reconnus comme des robots.

Vous pouvez aussi décider dans le resolver :

```js
resolve: async ({ isBot, path }) => {
  if (!isBot) return null
  // ...
}
```
