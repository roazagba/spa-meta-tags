# One site per subdomain

Many platforms give each customer their own subdomain: `alice.myshop.com`, `bob.myshop.com`, etc. The same SPA and the same server serve all of them, and the content depends on the domain.

## Find the customer from the host

The resolver receives the domain of the visitor in `host` (and `origin` with the protocol):

```js
resolve: async ({ host, path }) => {
  const storeDomain = host.split('.', 1)[0] // "alice"
  const slug = path.slice(1)

  const store = await api.getStore(storeDomain)
  if (!store) return { robots: 'noindex', status: 404 }

  if (!slug) {
    return { title: store.name, siteName: store.name, description: store.about, image: store.logo_url }
  }

  const product = await api.getProduct(storeDomain, slug)
  // ...
}
```

`host` contains the port when there is one (`alice.myshop.local:3000`). `split('.', 1)[0]` keeps only the first part in both cases.

## When your API identifies the customer from the request

Some APIs find the customer from the `Origin` header sent by the browser. On the server, there is no browser: forward the origin of the visitor yourself.

```js
resolve: async ({ origin, path }) => {
  const headers = { Origin: origin, Accept: 'application/json' }

  const [store, product] = await Promise.all([
    fetch(`${API}/public/store`, { headers }).then(r => (r.ok ? r.json() : null)),
    path !== '/' ? fetch(`${API}/public/products${path}`, { headers }).then(r => (r.ok ? r.json() : null)) : null,
  ])
  // ...
}
```

## The proxy must forward the real domain

In production, the domain comes from the `Host` header, or from `X-Forwarded-Host` when a reverse proxy sits in front of the server. If the proxy replaces it with `localhost:3000`, every request looks like it comes from the same customer. See [Production checklist](./production#reverse-proxy).

## Cache per customer

When the [cache](./performance) is enabled, the cache key contains the origin of the visitor: `alice.myshop.com/about` and `bob.myshop.com/about` are cached separately.
