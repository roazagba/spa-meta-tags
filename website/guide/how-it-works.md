# How it works

## The path of a request

```
Browser or crawler
      |
      |  GET /barca-2026-jersey
      v
Your Node server
      |
      |-- static files middleware: /assets/app.js, /logo.png, etc. are served directly
      |
      '-- spa-meta-tags middleware: every page request
            |
            |-- 1. build the context: origin, host, path, query, isBot
            |-- 2. call your resolver (with a timeout, and a cache if enabled)
            |-- 3. merge: page URL, then defaults, then resolver data
            |-- 4. build the tags (title, description, og:*, twitter:*, canonical...)
            |-- 5. inject them in the <head> of index.html
            '-- 6. send the page (status 200, or the status returned by the resolver)
```

## Which requests are handled

By default, the middleware handles a request when all these conditions are true:

- the method is `GET` or `HEAD`;
- the path has no file extension (`/products/42` yes, `/assets/app.js` or `/robots.txt` no);
- the request accepts HTML (`Accept` contains `text/html` or `*/*`), or has no `Accept` header.

Other requests are passed to the next middleware (`next()`), so your API routes and files keep working. You can change this rule with the [`shouldHandle`](../reference/options#shouldhandle) option.

## How the data is merged

The final data of a page is built from three sources, the last one winning:

1. `{ url }`: the URL of the page, without query string (`https://shop.example.com/barca-2026-jersey`);
2. your `defaults`;
3. the data returned by your resolver.

A value set to `undefined` does not override the previous one. This is handy:

```js
return {
  title: product.name,
  image: product.image_url ?? undefined, // no image: the default image is kept
}
```

## How the tags are injected

The package only modifies the `<head>` of `index.html`. The `<body>` is never touched.

1. The tags of the template that the page redefines are removed (for example the default `<title>` and `og:image`). The other tags (charset, viewport, styles, analytics) are kept.
2. The new tags are inserted where the `<!--seo-head-->` comment is, if your template has one, otherwise just before `</head>`.

See [The HTML template](./template) for the details.

## What the browser receives

The same HTML as a crawler. The SPA boots normally: the tags in the head do not change anything for it. If your app also updates the title on the client side (with `useHead`, `react-helmet`, etc.), it keeps doing it after the first load.

## Responses

| Case | Status | Body |
|---|---|---|
| Normal page | `200` | `index.html` with the tags |
| Resolver returns `{ status: 404 }` | `404` | `index.html` with the tags |
| Resolver fails or times out | `200` | `index.html` with the defaults |
| `HEAD` request | same as `GET` | empty |
| Request not handled (file, API, `POST`) | | passed to `next()` |
| Error in the template or `transformHtml` | | passed to `next(error)` |

Response headers: `Content-Type: text/html; charset=utf-8` and `Cache-Control: no-cache` (configurable with [`cacheControl`](../reference/options#cachecontrol)).
