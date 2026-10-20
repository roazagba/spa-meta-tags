# Fonctions

Tout est exporté depuis la racine du package :

```js
import {
  createSeoMiddleware, createSeoRenderer,
  buildSeoTags, renderSeoTags, injectSeoTags,
  mergeSeo, createSeoContext, getRequestOrigin, isBot, isPageRequest,
  htmlToText, truncate, escapeHtml, decodeEntities,
  SeoTimeoutError,
} from 'spa-meta-tags'
```

## Serveur

### `createSeoMiddleware(options)`

Crée un middleware Express / Connect / Node `http` qui sert la page de la SPA avec ses balises.

- `options` : voir [Options](./options).
- Renvoie : `(req, res, next?) => void`, avec une propriété `renderer` (le renderer utilisé en interne, voir ci-dessous).

```js
const seo = createSeoMiddleware({ template, resolve })
app.use(seo)
seo.renderer.clearCache()
```

### `createSeoRenderer(options)`

Crée un renderer, le cœur du middleware, utilisable avec n'importe quel serveur.

- `options` : [Options](./options), sauf celles réservées au middleware.
- Renvoie un objet avec :

| Méthode | Renvoie | Description |
|---|---|---|
| `getSeo(req)` | `Promise<SeoData>` | Données finales de la requête : URL, valeurs par défaut et données du resolver fusionnées |
| `getTags(req)` | `Promise<SeoTag[]>` | Balises de la requête |
| `renderTags(req)` | `Promise<string>` | Balises de la requête, en HTML |
| `render(req, html)` | `Promise<{ html, status }>` | Page avec les balises injectées, et le code HTTP à envoyer |
| `clearCache()` | `void` | Vide le cache |

```js
const renderer = createSeoRenderer({ resolve, defaults })
const { html, status } = await renderer.render(req, template)
```

## Balises

### `buildSeoTags(data, options?)`

Transforme des données SEO en liste de balises.

- `data` : [`SeoData`](./seo-data).
- `options.descriptionMaxLength` : `200` par défaut.
- Renvoie : `SeoTag[]`. Voir [Balises générées](./generated-tags).

### `renderSeoTags(tags)`

Écrit une liste de balises en HTML, une balise par ligne, avec toutes les valeurs échappées.

```js
renderSeoTags(buildSeoTags({ title: 'My page' }))
```

### `injectSeoTags(html, tags, options?)`

Injecte des balises dans le `<head>` d'une page HTML.

- `options.placeholder` : `'<!--seo-head-->'` par défaut.
- `options.replaceExisting` : `true` par défaut.
- Renvoie : le nouveau HTML.

```js
const page = injectSeoTags(template, buildSeoTags({ title: 'My page' }))
```

### `mergeSeo(...sources)`

Fusionne des objets de données SEO de gauche à droite. Les valeurs `undefined` ne remplacent pas les précédentes. Les sources `null` ou `undefined` sont ignorées.

```js
mergeSeo({ title: 'A', image: 'x.jpg' }, { title: 'B', image: undefined })
// { title: 'B', image: 'x.jpg' }
```

## Requêtes

### `createSeoContext(req, options?)`

Construit le [contexte](../guide/resolver#what-it-receives) passé au resolver.

- `options.trustProxy` : `true` par défaut.

### `getRequestOrigin(req, options?)`

Renvoie l'origine du visiteur (`https://shop.example.com`), à partir des en-têtes du proxy quand `trustProxy` vaut `true`, sinon à partir de `Host` et de l'état TLS de la connexion.

### `isBot(userAgent)`

Renvoie `true` quand le user agent est celui d'un robot : aperçus de liens (Facebook, WhatsApp, X, LinkedIn, Slack, Telegram, Discord, Pinterest, etc.), moteurs de recherche (Google, Bing, Yandex, Baidu, DuckDuckGo, Apple, etc.) ou robot générique.

```js
isBot('facebookexternalhit/1.1') // true
isBot('Mozilla/5.0 (Macintosh) ... Chrome/130') // false
```

### `isPageRequest(req)`

Filtre par défaut du middleware : `true` pour les requêtes `GET` et `HEAD` dont le chemin n'a pas d'extension de fichier et qui acceptent du HTML (ou n'ont pas d'en-tête `Accept`).

```js
shouldHandle: req => isPageRequest(req) && !req.url.startsWith('/api/')
```

## Texte

### `htmlToText(html)`

Convertit du HTML en texte : retire les blocs `<script>` et `<style>` et toutes les balises, décode les entités, réduit les espaces.

```js
htmlToText('<p>Hello&nbsp;<b>world</b></p>') // 'Hello world'
```

### `truncate(text, maxLength)`

Coupe un texte à `maxLength` caractères, points de suspension compris. Renvoie le texte tel quel s'il est assez court ou si `maxLength <= 0`.

### `escapeHtml(value)`

Échappe `&`, `<`, `>`, `"` et `'`.

### `decodeEntities(value)`

Décode les entités numériques (`&#233;`, `&#xE9;`) et les entités nommées courantes (`&amp;`, `&nbsp;`, `&eacute;`, `&rsquo;`, etc.). Les entités inconnues sont laissées telles quelles.

## Erreurs

### `SeoTimeoutError`

Erreur passée à `onError` quand le resolver met plus longtemps que `timeout`.

```js
onError: (error) => {
  if (error instanceof SeoTimeoutError) metrics.increment('seo.timeout')
}
```
