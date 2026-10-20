# Données SEO

`SeoData` est l'objet renvoyé par le [resolver](../guide/resolver) et accepté par `defaults` et `buildSeoTags`. Tous les champs sont facultatifs. Un champ absent, `null` ou vide ne produit aucune balise.

## Les champs

### `title`

- Type : `string`
- Balises : `<title>`, `og:title`, `twitter:title`, et `og:image:alt` quand `imageAlt` n'est pas renseigné.

```js
title: 'Barça 2026 Jersey | My Store'
```

Restez sous environ 60 caractères : les titres plus longs sont coupés par les moteurs de recherche et certaines plateformes.

### `description`

- Type : `string`, HTML accepté
- Balises : `description`, `og:description`, `twitter:description`

Le HTML est converti en texte (balises retirées, entités décodées, espaces réduits), puis coupé à [`descriptionMaxLength`](./options#descriptionmaxlength) caractères (200 par défaut), avec des points de suspension.

```js
description: '<p>The <strong>authentic</strong> &amp; lightweight jersey.</p>'
// -> The authentic & lightweight jersey.
```

### `image`

- Type : `string`, URL complète
- Balises : `og:image`, `twitter:image`. Fait aussi passer `twitter:card` à `summary_large_image`.

### `imageAlt`, `imageWidth`, `imageHeight`

- Types : `string`, `number`, `number`
- Balises : `og:image:alt`, `og:image:width`, `og:image:height`
- Produites seulement quand `image` est renseigné. `imageAlt` reprend `title` par défaut.

La largeur et la hauteur permettent à certaines plateformes d'afficher l'image sans la télécharger d'abord.

### `url`

- Type : `string`, URL complète
- Balise : `og:url`
- Par défaut (middleware et renderer) : l'URL demandée, sans paramètres.

### `canonical`

- Type : `string | false`
- Balise : `<link rel="canonical">`
- Par défaut : `url`. `false` pour ne produire aucun lien canonique.

### `type`

- Type : `string`
- Balise : `og:type`
- Par défaut : `website`. Valeurs courantes : `website`, `article`, `product`, `profile`, `video.other`, `music.song`.

### `siteName`

- Type : `string`
- Balise : `og:site_name`

### `locale`

- Type : `string`
- Balise : `og:locale`
- Format : `langue_PAYS`, par exemple `fr_FR`, `en_US`.

### `twitterCard`

- Type : `'summary' | 'summary_large_image' | 'app' | 'player'`
- Balise : `twitter:card`
- Par défaut : `summary_large_image` s'il y a une image, `summary` sinon.

### `twitterSite`

- Type : `string`
- Balise : `twitter:site`
- Le compte X (Twitter) du site, par exemple `@mystore`.

### `favicon`

- Type : `string`, URL complète
- Balise : `<link rel="icon">`
- Utile quand chaque client d'une plateforme a sa propre icône.

### `robots`

- Type : `string`
- Balise : `<meta name="robots">`
- Exemples : `noindex`, `noindex, nofollow`, `index, follow, max-image-preview:large`.

### `meta`

- Type : `Array<{ name: string, content: string } | { property: string, content: string }>`
- Balises meta supplémentaires, placées après les balises Open Graph et Twitter.

```js
meta: [
  { property: 'product:price:amount', content: '15000' },
  { property: 'product:price:currency', content: 'XOF' },
  { name: 'theme-color', content: '#0f172a' },
]
```

### `links`

- Type : `Array<{ rel: string, href: string, [attribut: string]: string }>`
- Balises link supplémentaires, placées après le lien canonique et le favicon.

```js
links: [
  { rel: 'alternate', href: 'https://example.com/fr/about', hreflang: 'fr' },
  { rel: 'alternate', href: 'https://example.com/about', hreflang: 'en' },
]
```

### `jsonLd`

- Type : `object | object[]`
- Produit des scripts `<script type="application/ld+json" data-spa-meta-tags>`. Voir [Données structurées](../guide/structured-data).

### `status`

- Type : `number`
- Code HTTP de la réponse envoyée par le middleware (`200` par défaut). N'est pas affiché comme une balise. Utilisez `404` pour une page introuvable.

## Ordre de fusion

Avec le middleware ou le renderer, les données finales sont :

1. `{ url }` (l'URL demandée) ;
2. puis `defaults` ;
3. puis les données renvoyées par le resolver.

Chaque source remplace les précédentes, sauf pour les valeurs `undefined`. Les tableaux (`meta`, `links`, `jsonLd`) remplacent le tableau précédent : ils ne sont pas combinés.
