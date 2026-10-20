# Performance and caching

Each page request calls your resolver, which usually calls your API. On a busy site, that is one or more API calls per page view. Three options reduce this cost.

## In-memory cache

```js
createSeoMiddleware({
  template,
  resolve,
  cache: { ttl: 5 * 60 * 1000, max: 500 },
})
```

| Setting | Description |
|---|---|
| `ttl` | Lifetime of an entry, in milliseconds. Required |
| `max` | Maximum number of cached pages. Defaults to `500`. When the cache is full, the least recently used page is removed |

How it works:

- The key is the origin, the path and the query string: `https://shop.example.com/jersey?ref=wa`. Two subdomains never share an entry.
- The result of the resolver is cached even when it is `null` (unknown page), so an unknown URL is not asked again until the entry expires.
- Errors and timeouts are **not** cached: the next request tries again.
- The cache lives in the memory of the Node process. With several instances of the server, each has its own cache. It is emptied when the server restarts.

Clear it when your data changes:

```js
const seo = createSeoMiddleware({ /* ... */ cache: { ttl: 10 * 60 * 1000 } })
app.use(seo)

// later
seo.renderer.clearCache()
```

::: tip Query strings and the cache
Links shared on social networks often get tracking parameters (`?fbclid=...`, `?utm_source=...`), which create one cache entry per shared link. The `max` setting keeps the memory bounded. If your pages do not depend on the query string, ignore it in the resolver and rely on the cache of your API, or keep a short `ttl`.
:::

## Crawlers only

```js
createSeoMiddleware({ template, resolve, defaults, botsOnly: true })
```

The resolver is only called for crawlers (link preview bots and search engines). Real visitors get the defaults immediately, without any API call: they do not need the tags, since the SPA updates the page.

Use it when your traffic is mostly human visitors. Leave it off if you want browsers to see the right title before the app has loaded, for example in the browser history or bookmarks.

## Timeout

```js
createSeoMiddleware({ template, resolve, timeout: 1500 })
```

The page is never delayed for more than `timeout` milliseconds (3000 by default): after that, it is sent with the defaults. Choose a value lower than the time your visitors are willing to wait for the first byte.

## Make the resolver fast

- Run independent API calls in parallel with `Promise.all`.
- Ask your API for the minimum: a light endpoint returning only the name, description and image is better than the full product.
- Set a timeout on your own requests (`AbortSignal.timeout(...)`), slightly lower than the `timeout` option.
