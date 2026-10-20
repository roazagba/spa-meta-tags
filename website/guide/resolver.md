# The resolver

The resolver is the function you write to describe each page. It receives the context of the request and returns its SEO data.

```js
async function resolve (context) {
  // context.path, context.host, context.query, etc.
  return { title, description, image }
}
```

## What it receives

| Field | Type | Example | Description |
|---|---|---|---|
| `path` | `string` | `/products/42` | Requested path, without query string |
| `query` | `URLSearchParams` | `query.get('ref')` | Query string parameters |
| `url` | `URL` | `url.href` | Full URL of the request |
| `origin` | `string` | `https://shop.example.com` | Protocol and domain of the visitor, behind the proxy |
| `host` | `string` | `shop.example.com` | Domain of the visitor (with the port, if any) |
| `isBot` | `boolean` | `true` | The request comes from a crawler (WhatsApp, Facebook, Google, etc.) |
| `req` | object | | The original request (Express, Node `http`) |

## What it can return

- An object with [SEO data](../reference/seo-data): every field is optional.
- `null` or `undefined`: the [defaults](../reference/options#defaults) are used.
- A promise of one of the above: the resolver can be `async`.

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

### The description

You can return the HTML of a rich text editor: the package removes the tags (and the content of `<script>` and `<style>`), decodes the entities (`&eacute;`, `&#39;`, etc.) and cuts the text at 200 characters, with an ellipsis. Change the length with [`descriptionMaxLength`](../reference/options#descriptionmaxlength).

### URLs must be absolute

`image`, `url`, `canonical` and `favicon` are used as is: crawlers need absolute URLs (`https://...`). If your API returns paths, build the URL:

```js
image: product.image_path ? `https://cdn.example.com/${product.image_path}` : undefined
```

`url` defaults to the requested URL without query string: you rarely need to set it.

### The status code

Return `status` to change the HTTP status of the page, for example `404` for a missing product. The status is not rendered as a tag. Crawlers and search engines then know that the page does not exist, and combined with `robots: 'noindex'` it is not indexed.

## Defaults

`defaults` are merged under the resolver data. Use them for what every page shares:

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

`defaults` can also be a function of the context, for example to build URLs from the domain of the visitor:

```js
defaults: ({ origin }) => ({
  image: `${origin}/og-image.jpg`,
  favicon: `${origin}/favicon.png`,
})
```

A value set to `undefined` in the resolver data does not override the default value. Arrays (`meta`, `links`, `jsonLd`) are replaced, not merged with the defaults.

## Errors and timeouts

The resolver is protected:

- if it **throws** or returns a rejected promise, the page is served with the defaults;
- if it takes more than **3 seconds** (option [`timeout`](../reference/options#timeout)), the page is served with the defaults, without waiting.

In both cases, [`onError`](../reference/options#onerror) is called, so you can log the problem:

```js
onError: (error, { url }) => console.error(`[seo] ${url.href}`, error)
```

Failures are not cached: the next request calls the resolver again.

::: warning
After a timeout, your resolver keeps running in the background (for example a `fetch` that never answers). Set a timeout on your own requests too, for example `fetch(url, { signal: AbortSignal.timeout(2500) })`.
:::

## Only for crawlers

By default the resolver is called for every page request, including real visitors. To save API calls, call it only for crawlers with [`botsOnly`](../reference/options#botsonly): visitors then get the defaults, which they do not see anyway (the SPA updates the page).

```js
createSeoMiddleware({ template, resolve, defaults, botsOnly: true })
```

The detection is based on the user agent. Search engines are detected as crawlers too.

You can also decide in the resolver:

```js
resolve: async ({ isBot, path }) => {
  if (!isBot) return null
  // ...
}
```
