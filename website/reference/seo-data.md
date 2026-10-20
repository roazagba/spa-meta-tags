# SEO data

`SeoData` is the object returned by the [resolver](../guide/resolver) and accepted by `defaults` and `buildSeoTags`. Every field is optional. A missing, `null` or empty field produces no tag.

## Fields

### `title`

- Type: `string`
- Tags: `<title>`, `og:title`, `twitter:title`, and `og:image:alt` when `imageAlt` is not set.

```js
title: 'Barça 2026 Jersey | My Store'
```

Keep it under about 60 characters: longer titles are cut by search engines and some platforms.

### `description`

- Type: `string`, HTML allowed
- Tags: `description`, `og:description`, `twitter:description`

The HTML is converted to plain text (tags removed, entities decoded, spaces collapsed), then cut at [`descriptionMaxLength`](./options#descriptionmaxlength) characters (200 by default) with an ellipsis.

```js
description: '<p>The <strong>authentic</strong> &amp; lightweight jersey.</p>'
// -> The authentic & lightweight jersey.
```

### `image`

- Type: `string`, absolute URL
- Tags: `og:image`, `twitter:image`. Also turns `twitter:card` into `summary_large_image`.

### `imageAlt`, `imageWidth`, `imageHeight`

- Types: `string`, `number`, `number`
- Tags: `og:image:alt`, `og:image:width`, `og:image:height`
- Only rendered when `image` is set. `imageAlt` defaults to `title`.

Width and height let some platforms show the image without downloading it first.

### `url`

- Type: `string`, absolute URL
- Tag: `og:url`
- Default (middleware and renderer): the requested URL, without query string.

### `canonical`

- Type: `string | false`
- Tag: `<link rel="canonical">`
- Default: `url`. Set `false` to render no canonical link.

### `type`

- Type: `string`
- Tag: `og:type`
- Default: `website`. Common values: `website`, `article`, `product`, `profile`, `video.other`, `music.song`.

### `siteName`

- Type: `string`
- Tag: `og:site_name`

### `locale`

- Type: `string`
- Tag: `og:locale`
- Format: `language_TERRITORY`, for example `en_US`, `fr_FR`.

### `twitterCard`

- Type: `'summary' | 'summary_large_image' | 'app' | 'player'`
- Tag: `twitter:card`
- Default: `summary_large_image` when there is an image, `summary` otherwise.

### `twitterSite`

- Type: `string`
- Tag: `twitter:site`
- The X (Twitter) account of the site, for example `@mystore`.

### `favicon`

- Type: `string`, absolute URL
- Tag: `<link rel="icon">`
- Useful when each customer of a platform has its own icon.

### `robots`

- Type: `string`
- Tag: `<meta name="robots">`
- Examples: `noindex`, `noindex, nofollow`, `index, follow, max-image-preview:large`.

### `meta`

- Type: `Array<{ name: string, content: string } | { property: string, content: string }>`
- Additional meta tags, rendered after the Open Graph and Twitter tags.

```js
meta: [
  { property: 'product:price:amount', content: '15000' },
  { property: 'product:price:currency', content: 'XOF' },
  { name: 'theme-color', content: '#0f172a' },
]
```

### `links`

- Type: `Array<{ rel: string, href: string, [attribute: string]: string }>`
- Additional link tags, rendered after the canonical link and the favicon.

```js
links: [
  { rel: 'alternate', href: 'https://example.com/fr/about', hreflang: 'fr' },
  { rel: 'alternate', href: 'https://example.com/about', hreflang: 'en' },
]
```

### `jsonLd`

- Type: `object | object[]`
- Rendered as `<script type="application/ld+json" data-spa-meta-tags>` scripts. See [Structured data](../guide/structured-data).

### `status`

- Type: `number`
- HTTP status of the response sent by the middleware (`200` by default). Not rendered as a tag. Use `404` for a missing page.

## Merge order

With the middleware or the renderer, the final data is:

1. `{ url }` (the requested URL);
2. then `defaults`;
3. then the data returned by the resolver.

Each source overrides the previous ones, except for `undefined` values. Arrays (`meta`, `links`, `jsonLd`) replace the previous array: they are not combined.
