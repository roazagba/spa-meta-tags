# Liste de contrôle pour la production

## Le proxy {#reverse-proxy}

En production, le serveur Node est en général placé derrière un proxy : Nginx, Traefik, Caddy, un répartiteur de charge, Cloudflare, ou le routeur de votre hébergeur (Heroku, Dokku, Render, Railway, etc.). Le proxy reçoit la requête sur `https://shop.example.com` et la transmet à `http://localhost:3000`.

Pour construire les bonnes URL (`og:url`, lien canonique) et donner le bon `host` à votre resolver, le proxy doit transmettre :

| En-tête | Valeur |
|---|---|
| `Host` ou `X-Forwarded-Host` | le vrai domaine : `shop.example.com` |
| `X-Forwarded-Proto` | `https` |

La plupart des routeurs d'hébergeurs le font par défaut. Avec Nginx :

```nginx
location / {
  proxy_pass http://localhost:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

Vérifiez-le une fois déployé :

```bash
curl -s https://shop.example.com/ | grep -E "og:url|canonical"
```

L'URL doit commencer par `https://` et contenir votre vrai domaine.

### Sans proxy

Si le serveur Node est exposé directement à Internet, mettez `trustProxy: false` : le package ignore alors les en-têtes `X-Forwarded-*`, que n'importe quel client pourrait falsifier, et n'utilise que `Host` et l'état TLS de la connexion.

## Les images

L'image d'aperçu est ce qui fait remarquer un lien. Les robots sont exigeants :

- **URL complète et publique** : `https://...`, accessible sans connexion, depuis Internet.
- **Format** : JPEG ou PNG. Le WebP fonctionne sur Facebook et LinkedIn, mais n'est pas affiché par toutes les plateformes.
- **Dimensions** : au moins 600 x 315 px, idéalement 1200 x 630 px (1,91:1) pour les grandes cartes. Une image carrée (1200 x 1200 px) fonctionne aussi.
- **Poids** : restez sous 300 Ko si possible. WhatsApp ignore souvent l'image des fichiers lourds.

Définissez une image par défaut dans `defaults`, pour que chaque page en ait une.

## robots.txt {#robots-txt}

Ajoutez un `robots.txt` à vos fichiers statiques, par exemple dans `public/robots.txt` avec Vite :

```
User-agent: *
Allow: /
```

Sans lui, `/robots.txt` peut tomber sur votre SPA et renvoyer la page HTML. Le robot de Facebook considère alors qu'il n'a pas le droit de lire le site, et son débogueur affiche une erreur.

## Les fichiers statiques avant le middleware

```js
app.use(express.static('dist', { index: false }))
app.use(createSeoMiddleware({ /* ... */ }))
```

- Les fichiers statiques d'abord, pour que `/assets/...` soit servi directement.
- `index: false`, pour que `/` passe par le middleware.

## Le cache du HTML

La page HTML est envoyée avec `Cache-Control: no-cache` par défaut : navigateurs et CDN la revalident à chaque visite, parce que les balises dépendent de données qui peuvent changer. Si vous placez un CDN devant le serveur, vérifiez qu'il ne garde pas le HTML en cache plus longtemps que ce que vos données permettent. Vos fichiers JS, CSS et images ne sont pas concernés : ils sont servis par le middleware statique, avec leurs propres en-têtes.

## La liste

- [ ] Le proxy transmet le vrai domaine et `https`.
- [ ] Chaque page a un titre, une description et une image (du resolver ou des valeurs par défaut).
- [ ] Les images ont des URL complètes et publiques, en JPEG ou PNG, pas trop lourdes.
- [ ] `robots.txt` existe.
- [ ] Les fichiers statiques sont servis avant le middleware, avec `index: false`.
- [ ] `onError` enregistre les erreurs du resolver.
- [ ] Le resolver et vos appels d'API ont un délai maximum.
- [ ] Un lien partagé a été vérifié avec le [débogueur de partage Facebook](./testing-previews).
