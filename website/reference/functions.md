# Functions

Everything is exported from the package root:

```js
import {
  createSeoMiddleware, createSeoRenderer,
  buildSeoTags, renderSeoTags, injectSeoTags,
  mergeSeo, createSeoContext, getRequestOrigin, isBot, isPageRequest,
  htmlToText, truncate, escapeHtml, decodeEntities,
  SeoTimeoutError,
} from 'spa-meta-tags'
```

## Server

### `createSeoMiddleware(options)`

Creates an Express / Connect / Node `http` middleware that serves the SPA page with its tags.

- `options`: see [Options](./options).
- Returns: `(req, res, next?) => void`, with a `renderer` property (the renderer used internally, see below).

```js
const seo = createSeoMiddleware({ template, resolve })
app.use(seo)
seo.renderer.clearCache()
```

### `createSeoRenderer(options)`

Creates a renderer, the core of the middleware, usable with any server.

- `options`: [Options](./options), except the middleware only ones.
- Returns an object with:

| Method | Returns | Description |
|---|---|---|
| `getSeo(req)` | `Promise<SeoData>` | Final data of the request: URL, defaults and resolver data merged |
| `getTags(req)` | `Promise<SeoTag[]>` | Tags of the request |
| `renderTags(req)` | `Promise<string>` | Tags of the request, as HTML |
| `render(req, html)` | `Promise<{ html, status }>` | Page with the tags injected, and the HTTP status to send |
| `clearCache()` | `void` | Empties the cache |

```js
const renderer = createSeoRenderer({ resolve, defaults })
const { html, status } = await renderer.render(req, template)
```

## Tags

### `buildSeoTags(data, options?)`

Turns SEO data into a list of tags.

- `data`: [`SeoData`](./seo-data).
- `options.descriptionMaxLength`: default `200`.
- Returns: `SeoTag[]`. See [Generated tags](./generated-tags).

### `renderSeoTags(tags)`

Renders a list of tags as HTML, one tag per line, with every value escaped.

```js
renderSeoTags(buildSeoTags({ title: 'My page' }))
```

### `injectSeoTags(html, tags, options?)`

Injects tags in the `<head>` of an HTML page.

- `options.placeholder`: default `'<!--seo-head-->'`.
- `options.replaceExisting`: default `true`.
- Returns: the new HTML.

```js
const page = injectSeoTags(template, buildSeoTags({ title: 'My page' }))
```

### `mergeSeo(...sources)`

Merges SEO data objects from left to right. `undefined` values do not override previous values. `null` or `undefined` sources are ignored.

```js
mergeSeo({ title: 'A', image: 'x.jpg' }, { title: 'B', image: undefined })
// { title: 'B', image: 'x.jpg' }
```

## Requests

### `createSeoContext(req, options?)`

Builds the [context](../guide/resolver#what-it-receives) given to the resolver.

- `options.trustProxy`: default `true`.

### `getRequestOrigin(req, options?)`

Returns the origin of the visitor (`https://shop.example.com`), from the proxy headers when `trustProxy` is `true`, otherwise from `Host` and the TLS state of the connection.

### `isBot(userAgent)`

Returns `true` when the user agent belongs to a crawler: link previews (Facebook, WhatsApp, X, LinkedIn, Slack, Telegram, Discord, Pinterest, etc.), search engines (Google, Bing, Yandex, Baidu, DuckDuckGo, Apple, etc.) or a generic bot.

```js
isBot('facebookexternalhit/1.1') // true
isBot('Mozilla/5.0 (Macintosh) ... Chrome/130') // false
```

### `isPageRequest(req)`

Default filter of the middleware: `true` for `GET` and `HEAD` requests whose path has no file extension and that accept HTML (or have no `Accept` header).

```js
shouldHandle: req => isPageRequest(req) && !req.url.startsWith('/api/')
```

## Text

### `htmlToText(html)`

Converts HTML to plain text: removes `<script>` and `<style>` blocks and every tag, decodes entities, collapses spaces.

```js
htmlToText('<p>Hello&nbsp;<b>world</b></p>') // 'Hello world'
```

### `truncate(text, maxLength)`

Cuts a text to `maxLength` characters, ellipsis included. Returns the text unchanged when it is short enough or when `maxLength <= 0`.

### `escapeHtml(value)`

Escapes `&`, `<`, `>`, `"` and `'`.

### `decodeEntities(value)`

Decodes numeric entities (`&#233;`, `&#xE9;`) and the common named ones (`&amp;`, `&nbsp;`, `&eacute;`, `&rsquo;`, etc.). Unknown entities are left unchanged.

## Errors

### `SeoTimeoutError`

Error given to `onError` when the resolver takes longer than `timeout`.

```js
onError: (error) => {
  if (error instanceof SeoTimeoutError) metrics.increment('seo.timeout')
}
```
