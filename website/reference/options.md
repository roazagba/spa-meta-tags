# Options

Options of `createSeoMiddleware(options)`. All the options except `template`, `transformHtml`, `shouldHandle` and `cacheControl` are also accepted by `createSeoRenderer(options)`.

```js
createSeoMiddleware({
  template,                  // required (middleware only)
  resolve,                   // required
  defaults: {},
  timeout: 3000,
  cache: false,
  botsOnly: false,
  onError: undefined,
  trustProxy: true,
  descriptionMaxLength: 200,
  placeholder: '<!--seo-head-->',
  replaceExisting: true,
  transformHtml: undefined,  // middleware only
  shouldHandle: isPageRequest, // middleware only
  cacheControl: 'no-cache',  // middleware only
})
```

## Data

### `resolve`

- Type: `(context: SeoContext) => SeoData | null | undefined | Promise<...>`
- Required

Returns the SEO data of the requested page. See [The resolver](../guide/resolver).

### `defaults`

- Type: `SeoData | (context: SeoContext) => SeoData`
- Default: `{}`

Data merged under the resolver data, and used alone when the resolver returns nothing, fails or times out.

## Resilience

### `timeout`

- Type: `number` (milliseconds)
- Default: `3000`

Maximum time given to the resolver. After it, the page is sent with the defaults and `onError` receives a `SeoTimeoutError`. `0` disables the timeout.

### `onError`

- Type: `(error: unknown, context: SeoContext) => void`
- Default: none

Called when the resolver throws, rejects or times out.

```js
onError: (error, { url }) => console.error(`[seo] ${url.href}`, error)
```

## Performance

### `cache`

- Type: `false | { ttl: number, max?: number }`
- Default: `false`

In-memory cache of the resolver results, per origin, path and query string. `ttl` is the lifetime in milliseconds, `max` the maximum number of entries (default `500`). See [Performance and caching](../guide/performance).

### `botsOnly`

- Type: `boolean`
- Default: `false`

Only calls the resolver for crawlers. Other visitors get the defaults.

## Request

### `trustProxy`

- Type: `boolean`
- Default: `true`

Reads `X-Forwarded-Proto` and `X-Forwarded-Host` to find the origin of the visitor. Set `false` when the server is not behind a reverse proxy.

## Tags

### `descriptionMaxLength`

- Type: `number`
- Default: `200`

Maximum length of the description, ellipsis included. `0` disables truncation.

## Injection

### `placeholder`

- Type: `string`
- Default: `'<!--seo-head-->'`

Text of the template replaced by the tags. When it is not found, the tags are inserted before `</head>`.

### `replaceExisting`

- Type: `boolean`
- Default: `true`

Removes the tags of the template that the page redefines. See [The HTML template](../guide/template#default-tags-in-the-template).

## Middleware only

### `template`

- Type: `string | (req) => string | Promise<string>`
- Required

The `index.html` of the SPA. Pass a string in production (read once at startup) and a function in development (read on each request).

### `transformHtml`

- Type: `(html: string, req) => string | Promise<string>`
- Default: none

Transforms the template before the injection. Typically `vite.transformIndexHtml` in development.

### `shouldHandle`

- Type: `(req) => boolean`
- Default: [`isPageRequest`](./functions#ispagerequest-req)

Decides which requests are handled. Other requests are passed to `next()` (or answered with `404` without `next`).

```js
shouldHandle: req => req.method === 'GET' && !req.url.startsWith('/api/')
```

### `cacheControl`

- Type: `string | false`
- Default: `'no-cache'`

Value of the `Cache-Control` header of the HTML response. `false` to leave it unset.
