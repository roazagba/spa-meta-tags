# Options

Options de `createSeoMiddleware(options)`. Toutes les options sauf `template`, `transformHtml`, `shouldHandle` et `cacheControl` sont aussi acceptées par `createSeoRenderer(options)`.

```js
createSeoMiddleware({
  template,                    // obligatoire (middleware uniquement)
  resolve,                     // obligatoire
  defaults: {},
  timeout: 3000,
  cache: false,
  botsOnly: false,
  onError: undefined,
  trustProxy: true,
  descriptionMaxLength: 200,
  placeholder: '<!--seo-head-->',
  replaceExisting: true,
  transformHtml: undefined,    // middleware uniquement
  shouldHandle: isPageRequest, // middleware uniquement
  cacheControl: 'no-cache',    // middleware uniquement
})
```

## Données

### `resolve`

- Type : `(context: SeoContext) => SeoData | null | undefined | Promise<...>`
- Obligatoire

Renvoie les données SEO de la page demandée. Voir [Le resolver](../guide/resolver).

### `defaults`

- Type : `SeoData | (context: SeoContext) => SeoData`
- Par défaut : `{}`

Données fusionnées sous celles du resolver, et utilisées seules quand le resolver ne renvoie rien, échoue ou dépasse le délai.

## Robustesse

### `timeout`

- Type : `number` (millisecondes)
- Par défaut : `3000`

Temps maximum laissé au resolver. Au-delà, la page est envoyée avec les valeurs par défaut et `onError` reçoit une `SeoTimeoutError`. `0` désactive le délai.

### `onError`

- Type : `(error: unknown, context: SeoContext) => void`
- Par défaut : aucune

Appelée quand le resolver lance une erreur, renvoie une promesse rejetée ou dépasse le délai.

```js
onError: (error, { url }) => console.error(`[seo] ${url.href}`, error)
```

## Performances

### `cache`

- Type : `false | { ttl: number, max?: number }`
- Par défaut : `false`

Cache en mémoire des résultats du resolver, par origine, chemin et paramètres. `ttl` est la durée de vie en millisecondes, `max` le nombre maximum d'entrées (`500` par défaut). Voir [Performances et cache](../guide/performance).

### `botsOnly`

- Type : `boolean`
- Par défaut : `false`

N'appelle le resolver que pour les robots. Les autres visiteurs reçoivent les valeurs par défaut.

## Requête

### `trustProxy`

- Type : `boolean`
- Par défaut : `true`

Lit `X-Forwarded-Proto` et `X-Forwarded-Host` pour trouver l'origine du visiteur. Mettez `false` quand le serveur n'est pas derrière un proxy.

## Balises

### `descriptionMaxLength`

- Type : `number`
- Par défaut : `200`

Longueur maximum de la description, points de suspension compris. `0` désactive la coupure.

## Injection

### `placeholder`

- Type : `string`
- Par défaut : `'<!--seo-head-->'`

Texte du template remplacé par les balises. S'il est absent, les balises sont insérées avant `</head>`.

### `replaceExisting`

- Type : `boolean`
- Par défaut : `true`

Retire les balises du template que la page redéfinit. Voir [Le template HTML](../guide/template#default-tags-in-the-template).

## Middleware uniquement

### `template`

- Type : `string | (req) => string | Promise<string>`
- Obligatoire

Le `index.html` de la SPA. Passez un texte en production (lu une seule fois au démarrage) et une fonction en développement (relu à chaque requête).

### `transformHtml`

- Type : `(html: string, req) => string | Promise<string>`
- Par défaut : aucune

Transforme le template avant l'injection. En général `vite.transformIndexHtml` en développement.

### `shouldHandle`

- Type : `(req) => boolean`
- Par défaut : [`isPageRequest`](./functions#ispagerequest-req)

Décide quelles requêtes sont traitées. Les autres sont passées à `next()` (ou reçoivent une réponse `404` sans `next`).

```js
shouldHandle: req => req.method === 'GET' && !req.url.startsWith('/api/')
```

### `cacheControl`

- Type : `string | false`
- Par défaut : `'no-cache'`

Valeur de l'en-tête `Cache-Control` de la page HTML. `false` pour ne pas l'envoyer.
