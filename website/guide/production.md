# Production checklist

## Reverse proxy

In production, the Node server usually sits behind a reverse proxy: Nginx, Traefik, Caddy, a load balancer, Cloudflare, or the router of your host (Heroku, Dokku, Render, Railway, etc.). The proxy receives the request on `https://shop.example.com` and forwards it to `http://localhost:3000`.

To build the right URLs (`og:url`, canonical link) and give the right `host` to your resolver, the proxy must forward:

| Header | Value |
|---|---|
| `Host` or `X-Forwarded-Host` | the real domain: `shop.example.com` |
| `X-Forwarded-Proto` | `https` |

Most hosting routers do it by default. With Nginx:

```nginx
location / {
  proxy_pass http://localhost:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

Check it once deployed:

```bash
curl -s https://shop.example.com/ | grep -E "og:url|canonical"
```

The URL must start with `https://` and contain your real domain.

### Without a reverse proxy

If the Node server is directly exposed to the internet, set `trustProxy: false`: the package then ignores the `X-Forwarded-*` headers, which any client could forge, and only uses `Host` and the TLS state of the connection.

## Images

The preview image is what makes a link stand out. Crawlers are strict about it:

- **Absolute and public URL**: `https://...`, reachable without login, from the internet.
- **Format**: JPEG or PNG. WebP works on Facebook and LinkedIn but is not displayed by every platform.
- **Size**: at least 600 x 315 px, ideally 1200 x 630 px (1.91:1) for large cards. A square image (1200 x 1200 px) also works.
- **Weight**: keep it under 300 KB if you can. WhatsApp often skips the image of heavy files.

Set a default image in `defaults`, so that every page has one.

## robots.txt

Add a `robots.txt` to your static files, for example in `public/robots.txt` with Vite:

```
User-agent: *
Allow: /
```

Without it, `/robots.txt` may fall back to your SPA and return the HTML page. The Facebook crawler then considers that it is not allowed to read the site and answers with an error in its debugger.

## Static files before the middleware

```js
app.use(express.static('dist', { index: false }))
app.use(createSeoMiddleware({ /* ... */ }))
```

- Static files first, so that `/assets/...` is served directly.
- `index: false`, so that `/` goes through the middleware.

## HTML cache

The HTML response is sent with `Cache-Control: no-cache` by default: browsers and CDNs revalidate it on each visit, because the tags depend on data that can change. If you put a CDN in front of the server, make sure it does not cache the HTML for longer than your data needs. Your JS, CSS and image files are not concerned: they are served by the static middleware with their own headers.

## Checklist

- [ ] The proxy forwards the real domain and `https`.
- [ ] Every page has a title, a description and an image (from the resolver or the defaults).
- [ ] Images are absolute, public URLs, in JPEG or PNG, not too heavy.
- [ ] `robots.txt` exists.
- [ ] Static files are served before the middleware, with `index: false`.
- [ ] `onError` logs the resolver errors.
- [ ] The resolver and your API calls have a timeout.
- [ ] A shared link has been checked with the [Facebook Sharing Debugger](./testing-previews).
