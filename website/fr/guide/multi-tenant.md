# Un site par sous-domaine

Beaucoup de plateformes donnent à chaque client son propre sous-domaine : `alice.myshop.com`, `bob.myshop.com`, etc. La même SPA et le même serveur les servent tous, et le contenu dépend du domaine.

## Trouver le client à partir du domaine

Le resolver reçoit le domaine du visiteur dans `host` (et `origin`, avec le protocole) :

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

`host` contient le port quand il y en a un (`alice.myshop.local:3000`). `split('.', 1)[0]` ne garde que la première partie dans les deux cas.

## Quand votre API identifie le client grâce à la requête {#when-your-api-identifies-the-customer-from-the-request}

Certaines API retrouvent le client grâce à l'en-tête `Origin` envoyé par le navigateur. Sur le serveur, il n'y a pas de navigateur : transmettez vous-même l'origine du visiteur.

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

## Le proxy doit transmettre le vrai domaine

En production, le domaine vient de l'en-tête `Host`, ou de `X-Forwarded-Host` quand un proxy est placé devant le serveur. Si le proxy le remplace par `localhost:3000`, toutes les requêtes semblent venir du même client. Voir [Liste de contrôle](./production#reverse-proxy).

## Un cache par client

Quand le [cache](./performance) est activé, la clé du cache contient l'origine du visiteur : `alice.myshop.com/about` et `bob.myshop.com/about` sont mis en cache séparément.
