# Balises générées

Cette page montre le HTML exact produit par le package, dans l'ordre où il est écrit.

## Exemple complet

```js
buildSeoTags({
  title: 'Barça 2026 Jersey | My Store',
  description: '<p>The <strong>authentic</strong> &amp; lightweight jersey.</p>',
  image: 'https://cdn.example.com/jersey.jpg',
  imageAlt: 'Barça 2026 Jersey',
  imageWidth: 1200,
  imageHeight: 630,
  url: 'https://shop.example.com/barca-2026-jersey',
  type: 'product',
  siteName: 'My Store',
  locale: 'en_US',
  twitterSite: '@mystore',
  favicon: 'https://shop.example.com/favicon.png',
  robots: 'index, follow',
  meta: [
    { property: 'product:price:amount', content: '15000' },
    { property: 'product:price:currency', content: 'XOF' },
  ],
  links: [{ rel: 'alternate', href: 'https://shop.example.com/fr/barca-2026-jersey', hreflang: 'fr' }],
  jsonLd: { '@context': 'https://schema.org', '@type': 'Product', 'name': 'Barça 2026 Jersey' },
})
```

```html
<title>Barça 2026 Jersey | My Store</title>
<meta name="description" content="The authentic &amp; lightweight jersey.">
<meta name="robots" content="index, follow">
<meta property="og:type" content="product">
<meta property="og:site_name" content="My Store">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="Barça 2026 Jersey | My Store">
<meta property="og:description" content="The authentic &amp; lightweight jersey.">
<meta property="og:url" content="https://shop.example.com/barca-2026-jersey">
<meta property="og:image" content="https://cdn.example.com/jersey.jpg">
<meta property="og:image:alt" content="Barça 2026 Jersey">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@mystore">
<meta name="twitter:title" content="Barça 2026 Jersey | My Store">
<meta name="twitter:description" content="The authentic &amp; lightweight jersey.">
<meta name="twitter:image" content="https://cdn.example.com/jersey.jpg">
<meta property="product:price:amount" content="15000">
<meta property="product:price:currency" content="XOF">
<link rel="canonical" href="https://shop.example.com/barca-2026-jersey">
<link rel="icon" href="https://shop.example.com/favicon.png">
<link rel="alternate" href="https://shop.example.com/fr/barca-2026-jersey" hreflang="fr">
<script type="application/ld+json" data-spa-meta-tags>{"@context":"https://schema.org","@type":"Product","name":"Barça 2026 Jersey"}</script>
```

## Exemple minimal

Seules les balises qui ont une valeur sont produites :

```js
buildSeoTags({ title: 'My Store' })
```

```html
<title>My Store</title>
<meta property="og:type" content="website">
<meta property="og:title" content="My Store">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="My Store">
```

Avec le middleware ou le renderer, `og:url` et le lien canonique sont toujours ajoutés, à partir de l'URL demandée.

## Règles

| Balise | Produite quand | Valeur |
|---|---|---|
| `<title>` | `title` | `title` |
| `description` | `description` | texte de `description`, coupé |
| `robots` | `robots` | `robots` |
| `og:type` | toujours | `type`, ou `website` |
| `og:site_name` | `siteName` | `siteName` |
| `og:locale` | `locale` | `locale` |
| `og:title` | `title` | `title` |
| `og:description` | `description` | texte de `description`, coupé |
| `og:url` | `url` | `url` |
| `og:image` | `image` | `image` |
| `og:image:alt` | `image` et (`imageAlt` ou `title`) | `imageAlt`, ou `title` |
| `og:image:width`, `og:image:height` | `image` et la dimension | `imageWidth`, `imageHeight` |
| `twitter:card` | toujours | `twitterCard`, ou `summary_large_image` avec une image, ou `summary` |
| `twitter:site` | `twitterSite` | `twitterSite` |
| `twitter:title` | `title` | `title` |
| `twitter:description` | `description` | texte de `description`, coupé |
| `twitter:image` | `image` | `image` |
| `meta` supplémentaires | chaque élément de `meta` | tels quels |
| `<link rel="canonical">` | `canonical`, ou `url` quand `canonical` ne vaut pas `false` | `canonical`, ou `url` |
| `<link rel="icon">` | `favicon` | `favicon` |
| `link` supplémentaires | chaque élément de `links` | tels quels |
| `<script>` JSON-LD | chaque élément de `jsonLd` | JSON, avec `<` écrit `<` |

## Échappement

Toutes les valeurs d'attribut et le titre sont échappés : `&`, `<`, `>`, `"` et `'` deviennent des entités. Une valeur ne peut donc jamais fermer une balise ni ajouter un attribut :

```js
buildSeoTags({ title: '"><script>alert(1)</script>' })
// <title>&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;</title>
```
