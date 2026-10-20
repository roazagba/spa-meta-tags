# Generated tags

This page shows the exact HTML produced by the package, in the order it is rendered.

## Full example

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

## Minimal example

Only the tags with a value are rendered:

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

With the middleware or the renderer, `og:url` and the canonical link are always added, from the requested URL.

## Rules

| Tag | Rendered when | Value |
|---|---|---|
| `<title>` | `title` | `title` |
| `description` | `description` | text of `description`, truncated |
| `robots` | `robots` | `robots` |
| `og:type` | always | `type`, or `website` |
| `og:site_name` | `siteName` | `siteName` |
| `og:locale` | `locale` | `locale` |
| `og:title` | `title` | `title` |
| `og:description` | `description` | text of `description`, truncated |
| `og:url` | `url` | `url` |
| `og:image` | `image` | `image` |
| `og:image:alt` | `image` and (`imageAlt` or `title`) | `imageAlt`, or `title` |
| `og:image:width`, `og:image:height` | `image` and the size | `imageWidth`, `imageHeight` |
| `twitter:card` | always | `twitterCard`, or `summary_large_image` with an image, or `summary` |
| `twitter:site` | `twitterSite` | `twitterSite` |
| `twitter:title` | `title` | `title` |
| `twitter:description` | `description` | text of `description`, truncated |
| `twitter:image` | `image` | `image` |
| extra `meta` | each item of `meta` | as given |
| `<link rel="canonical">` | `canonical`, or `url` when `canonical` is not `false` | `canonical`, or `url` |
| `<link rel="icon">` | `favicon` | `favicon` |
| extra `link` | each item of `links` | as given |
| JSON-LD `<script>` | each item of `jsonLd` | JSON, with `<` written `<` |

## Escaping

Every attribute value and the title are escaped: `&`, `<`, `>`, `"` and `'` become entities. A value can therefore never close a tag or add an attribute:

```js
buildSeoTags({ title: '"><script>alert(1)</script>' })
// <title>&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;</title>
```
