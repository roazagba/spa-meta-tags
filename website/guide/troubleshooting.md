# Troubleshooting

## The preview shows the default title for every page

1. Check that the request reaches the middleware:
   ```bash
   curl -s -A "facebookexternalhit/1.1" https://your-site/a-page | grep "<title>"
   ```
2. If you get the title of `index.html`:
   - a static middleware serves `index.html` before the package: use `express.static(dir, { index: false })` and place it before the middleware;
   - another fallback (`app.get('*', ...)`, `connect-history-api-fallback`) is placed before the middleware: remove it, the middleware replaces it.
3. If you get the defaults of the package, the resolver returned nothing or failed: add `onError` and log what the resolver receives.

## The URLs contain `localhost` or `http://`

The reverse proxy does not forward the real domain or the protocol. See [Production checklist](./production#reverse-proxy).

## The resolver does not find the customer or the page

- Log the context: `resolve: (context) => { console.log(context.host, context.path); ... }`.
- In a multi-tenant app, check the domain seen by the server (proxy headers, tunnel domain in development).
- If your API identifies the customer from the `Origin` header, forward it: see [One site per subdomain](./multi-tenant#when-your-api-identifies-the-customer-from-the-request).

## The image does not appear

- Open the URL of `og:image` in a private window: it must load without login.
- Use JPEG or PNG, under 300 KB.
- Check that the URL is absolute.

## Facebook shows an error or a 403

- Add a real `robots.txt` (see [Production checklist](./production#robots-txt)).
- Click **Scrape Again** in the debugger: Facebook may show a cached result.

## The page has two titles or two descriptions

A tag of the template was not recognized as the same tag. The most common cause is a Twitter tag written with `property` instead of `name`. See [The HTML template](./template#write-the-twitter-tags-with-name).

## A piece of text like `b">` appears in the head

A tag of the template has a `>` inside an attribute value. Write `&gt;` instead. See [The HTML template](./template#things-to-avoid-in-the-template).

## A page path with a dot is not handled

The default filter treats `/users/john.doe` as a file because it looks like a file extension. Pass your own filter:

```js
createSeoMiddleware({
  // ...
  shouldHandle: req => ['GET', 'HEAD'].includes(req.method) && !req.url.startsWith('/assets/'),
})
```

## Static hosting: a page opened directly shows no data

The app loads relative paths from the folder of the page (`/about/data/...`). Add `<base href="%BASE_URL%" />` to `index.html`. See [Static hosting](./static-hosting#relative-paths).

## The description is cut in the middle of an emoji

The description is cut at 200 characters, and an emoji right at the limit can be cut in two. Shorten the text or change [`descriptionMaxLength`](../reference/options#descriptionmaxlength).

## Still stuck?

[Open an issue](https://github.com/roazagba/spa-meta-tags/issues) with the version of the package, your server, the HTML you get and, for a preview problem, a screenshot of the Facebook debugger.
