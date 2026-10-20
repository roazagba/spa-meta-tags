# Fonctionnement

## Le parcours d'une requête

```
Navigateur ou robot
      |
      |  GET /barca-2026-jersey
      v
Votre serveur Node
      |
      |-- middleware des fichiers statiques : /assets/app.js, /logo.png, etc. sont servis directement
      |
      '-- middleware spa-meta-tags : toutes les requêtes de pages
            |
            |-- 1. construit le contexte : origin, host, path, query, isBot
            |-- 2. appelle votre resolver (avec un délai maximum, et un cache s'il est activé)
            |-- 3. fusionne : URL de la page, puis defaults, puis données du resolver
            |-- 4. construit les balises (title, description, og:*, twitter:*, canonical...)
            |-- 5. les injecte dans le <head> de index.html
            '-- 6. envoie la page (code 200, ou le code renvoyé par le resolver)
```

## Les requêtes traitées

Par défaut, le middleware traite une requête quand toutes ces conditions sont remplies :

- la méthode est `GET` ou `HEAD` ;
- le chemin n'a pas d'extension de fichier (`/products/42` oui, `/assets/app.js` ou `/robots.txt` non) ;
- la requête accepte du HTML (`Accept` contient `text/html` ou `*/*`), ou n'a pas d'en-tête `Accept`.

Les autres requêtes sont passées au middleware suivant (`next()`) : vos routes d'API et vos fichiers continuent de fonctionner. Vous pouvez changer cette règle avec l'option [`shouldHandle`](../reference/options#shouldhandle).

## La fusion des données

Les données finales d'une page viennent de trois sources, la dernière l'emportant :

1. `{ url }` : l'URL de la page, sans paramètres (`https://shop.example.com/barca-2026-jersey`) ;
2. vos `defaults` ;
3. les données renvoyées par votre resolver.

Une valeur `undefined` ne remplace pas la précédente. C'est pratique :

```js
return {
  title: product.name,
  image: product.image_url ?? undefined, // pas d'image : l'image par défaut est gardée
}
```

## L'injection des balises

Le package ne modifie que le `<head>` de `index.html`. Le `<body>` n'est jamais touché.

1. Les balises du template que la page redéfinit sont retirées (par exemple le `<title>` et l'`og:image` par défaut). Les autres balises (charset, viewport, styles, statistiques) sont conservées.
2. Les nouvelles balises sont insérées à la place du commentaire `<!--seo-head-->` si votre template en contient un, sinon juste avant `</head>`.

Voir [Le template HTML](./template) pour le détail.

## Ce que reçoit le navigateur

Le même HTML qu'un robot. La SPA démarre normalement : les balises du `<head>` ne changent rien pour elle. Si votre application met aussi à jour le titre côté navigateur (avec `useHead`, `react-helmet`, etc.), elle continue de le faire après le premier chargement.

## Les réponses

| Cas | Code | Contenu |
|---|---|---|
| Page normale | `200` | `index.html` avec les balises |
| Le resolver renvoie `{ status: 404 }` | `404` | `index.html` avec les balises |
| Le resolver échoue ou dépasse le délai | `200` | `index.html` avec les valeurs par défaut |
| Requête `HEAD` | comme pour `GET` | vide |
| Requête non traitée (fichier, API, `POST`) | | passée à `next()` |
| Erreur dans le template ou `transformHtml` | | passée à `next(error)` |

En-têtes de réponse : `Content-Type: text/html; charset=utf-8` et `Cache-Control: no-cache` (modifiable avec [`cacheControl`](../reference/options#cachecontrol)).
