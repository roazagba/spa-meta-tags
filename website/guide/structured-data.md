# Structured data (JSON-LD)

Search engines read [schema.org](https://schema.org/) structured data to show rich results: price and stock of a product, rating, breadcrumb, author and date of an article.

Return it in `jsonLd`, as an object or an array of objects:

```js
resolve: async ({ path, origin }) => {
  const product = await getProduct(path.slice(1))

  return {
    title: product.name,
    type: 'product',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'image': product.image_url,
      'description': product.short_description,
      'offers': {
        '@type': 'Offer',
        'price': product.price,
        'priceCurrency': product.currency,
        'availability': product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'url': `${origin}${path}`,
      },
    },
  }
}
```

Each object becomes a script in the `<head>`:

```html
<script type="application/ld+json" data-spa-meta-tags>{"@context":"https://schema.org","@type":"Product",...}</script>
```

Security: `<` characters in the JSON are written as `<`, so a value containing `</script>` cannot close the script and inject HTML.

Several objects:

```js
jsonLd: [
  { '@context': 'https://schema.org', '@type': 'Product', /* ... */ },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', /* ... */ },
]
```

Check the result with the [Rich Results Test](https://search.google.com/test/rich-results) of Google.

::: info
Social networks ignore JSON-LD: link previews only use the `og:*` and `twitter:*` tags.
:::
