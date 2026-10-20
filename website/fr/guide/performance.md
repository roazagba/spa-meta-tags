# Performances et cache

Chaque requête de page appelle votre resolver, qui appelle en général votre API. Sur un site très visité, ça fait un ou plusieurs appels d'API par page vue. Trois options réduisent ce coût.

## Cache en mémoire

```js
createSeoMiddleware({
  template,
  resolve,
  cache: { ttl: 5 * 60 * 1000, max: 500 },
})
```

| Réglage | Description |
|---|---|
| `ttl` | Durée de vie d'une entrée, en millisecondes. Obligatoire |
| `max` | Nombre maximum de pages en cache. Par défaut `500`. Quand le cache est plein, la page utilisée le moins récemment est retirée |

Fonctionnement :

- La clé est l'origine, le chemin et les paramètres : `https://shop.example.com/jersey?ref=wa`. Deux sous-domaines ne partagent jamais une entrée.
- Le résultat du resolver est mis en cache même quand il vaut `null` (page inconnue) : une URL inconnue n'est pas redemandée avant l'expiration de l'entrée.
- Les erreurs et les délais dépassés ne sont **pas** mis en cache : la requête suivante réessaie.
- Le cache vit dans la mémoire du processus Node. Avec plusieurs instances du serveur, chacune a son propre cache. Il est vidé au redémarrage du serveur.

Videz-le quand vos données changent :

```js
const seo = createSeoMiddleware({ /* ... */ cache: { ttl: 10 * 60 * 1000 } })
app.use(seo)

// plus tard
seo.renderer.clearCache()
```

::: tip Paramètres d'URL et cache
Les liens partagés sur les réseaux sociaux reçoivent souvent des paramètres de suivi (`?fbclid=...`, `?utm_source=...`), qui créent une entrée de cache par lien partagé. Le réglage `max` garde la mémoire sous contrôle. Si vos pages ne dépendent pas des paramètres, ignorez-les dans le resolver et comptez sur le cache de votre API, ou gardez un `ttl` court.
:::

## Seulement pour les robots

```js
createSeoMiddleware({ template, resolve, defaults, botsOnly: true })
```

Le resolver n'est appelé que pour les robots (aperçus de liens et moteurs de recherche). Les vrais visiteurs reçoivent immédiatement les valeurs par défaut, sans appel d'API : ils n'ont pas besoin des balises, puisque la SPA met la page à jour.

Utilisez-le quand votre trafic est surtout composé de visiteurs humains. Laissez-le désactivé si vous voulez que les navigateurs voient le bon titre avant le chargement de l'application, par exemple dans l'historique ou les favoris.

## Délai maximum

```js
createSeoMiddleware({ template, resolve, timeout: 1500 })
```

La page n'est jamais retardée de plus de `timeout` millisecondes (3000 par défaut) : au-delà, elle est envoyée avec les valeurs par défaut. Choisissez une valeur inférieure au temps que vos visiteurs acceptent d'attendre pour le premier affichage.

## Rendre le resolver rapide

- Lancez les appels d'API indépendants en parallèle avec `Promise.all`.
- Demandez le minimum à votre API : un point d'accès léger qui renvoie seulement le nom, la description et l'image vaut mieux que le produit complet.
- Mettez un délai sur vos propres requêtes (`AbortSignal.timeout(...)`), un peu inférieur à l'option `timeout`.
