# Données structurées (JSON-LD)

Les moteurs de recherche lisent les données structurées [schema.org](https://schema.org/) pour afficher des résultats enrichis : prix et stock d'un produit, note, fil d'Ariane, auteur et date d'un article.

Renvoyez-les dans `jsonLd`, sous forme d'objet ou de tableau d'objets :

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

Chaque objet devient un script dans le `<head>` :

```html
<script type="application/ld+json" data-spa-meta-tags>{"@context":"https://schema.org","@type":"Product",...}</script>
```

Sécurité : les caractères `<` du JSON sont écrits `<`. Une valeur contenant `</script>` ne peut donc pas fermer le script et injecter du HTML.

Plusieurs objets :

```js
jsonLd: [
  { '@context': 'https://schema.org', '@type': 'Product', /* ... */ },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', /* ... */ },
]
```

Vérifiez le résultat avec le [test des résultats enrichis](https://search.google.com/test/rich-results) de Google.

::: info
Les réseaux sociaux ignorent le JSON-LD : les aperçus de liens n'utilisent que les balises `og:*` et `twitter:*`.
:::
