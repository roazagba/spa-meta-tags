# Dépannage

## L'aperçu affiche le titre par défaut pour toutes les pages

1. Vérifiez que la requête arrive bien au middleware :
   ```bash
   curl -s -A "facebookexternalhit/1.1" https://votre-site/une-page | grep "<title>"
   ```
2. Si vous obtenez le titre de `index.html` :
   - un middleware de fichiers statiques sert `index.html` avant le package : utilisez `express.static(dossier, { index: false })` et placez-le avant le middleware ;
   - un autre mécanisme de repli (`app.get('*', ...)`, `connect-history-api-fallback`) est placé avant le middleware : retirez-le, le middleware le remplace.
3. Si vous obtenez les valeurs par défaut du package, le resolver n'a rien renvoyé ou a échoué : ajoutez `onError` et affichez ce que reçoit le resolver.

## Les URL contiennent `localhost` ou `http://`

Le proxy ne transmet pas le vrai domaine ou le protocole. Voir [Liste de contrôle](./production#reverse-proxy).

## Le resolver ne trouve pas le client ou la page

- Affichez le contexte : `resolve: (context) => { console.log(context.host, context.path); ... }`.
- Dans une application multi-clients, vérifiez le domaine vu par le serveur (en-têtes du proxy, domaine du tunnel en développement).
- Si votre API identifie le client grâce à l'en-tête `Origin`, transmettez-le : voir [Un site par sous-domaine](./multi-tenant#when-your-api-identifies-the-customer-from-the-request).

## L'image n'apparaît pas

- Ouvrez l'URL de `og:image` dans une fenêtre de navigation privée : elle doit se charger sans connexion.
- Utilisez du JPEG ou du PNG, de moins de 300 Ko.
- Vérifiez que l'URL est complète.

## Facebook affiche une erreur ou un 403

- Ajoutez un vrai `robots.txt` (voir [Liste de contrôle](./production#robots-txt)).
- Cliquez sur **Re-collecter** dans le débogueur : Facebook affiche peut-être un résultat gardé en cache.

## La page a deux titres ou deux descriptions

Une balise du template n'a pas été reconnue comme la même balise. La cause la plus fréquente : une balise Twitter écrite avec `property` au lieu de `name`. Voir [Le template HTML](./template#write-the-twitter-tags-with-name).

## Un morceau de texte comme `b">` apparaît dans le `<head>`

Une balise du template contient un `>` dans la valeur d'un attribut. Écrivez `&gt;` à la place. Voir [Le template HTML](./template#things-to-avoid-in-the-template).

## Un chemin de page avec un point n'est pas traité

Le filtre par défaut prend `/users/john.doe` pour un fichier, parce que la fin ressemble à une extension. Passez votre propre filtre :

```js
createSeoMiddleware({
  // ...
  shouldHandle: req => ['GET', 'HEAD'].includes(req.method) && !req.url.startsWith('/assets/'),
})
```

## Hébergement statique : une page ouverte directement n'affiche aucune donnée

L'application charge ses chemins relatifs depuis le dossier de la page (`/about/data/...`). Ajoutez `<base href="%BASE_URL%" />` à `index.html`. Voir [Hébergement statique](./static-hosting#relative-paths).

## La description est coupée au milieu d'un emoji

La description est coupée à 200 caractères, et un emoji placé pile à la limite peut être coupé en deux. Raccourcissez le texte ou changez [`descriptionMaxLength`](../reference/options#descriptionmaxlength).

## Toujours bloqué ?

[Ouvrez une issue](https://github.com/roazagba/spa-meta-tags/issues) avec la version du package, votre serveur, le HTML obtenu et, pour un problème d'aperçu, une capture du débogueur de Facebook.
