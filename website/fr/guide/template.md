# Le template HTML

Le template est le `index.html` de votre build (`dist/index.html` avec Vite). Le package injecte les balises de chaque page dans son `<head>`.

## L'emplacement des balises

Si le template contient le commentaire `<!--seo-head-->`, les balises le remplacent :

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!--seo-head-->
  <link rel="stylesheet" href="/app.css" />
</head>
```

Sinon, elles sont ajoutées juste avant `</head>`. Changez le commentaire avec l'option [`placeholder`](../reference/options#placeholder).

::: tip
Vite garde les commentaires HTML dans le build : `<!--seo-head-->` est donc toujours présent dans `dist/index.html`.
:::

## Les balises par défaut du template {#default-tags-in-the-template}

Vous pouvez garder des balises par défaut dans `index.html`, par exemple pour le développement en local sans le serveur :

```html
<title>My Store</title>
<meta name="description" content="Jerseys and sportswear" />
<meta property="og:image" content="https://shop.example.com/og-image.jpg" />
```

Quand une page redéfinit une balise, la balise du template est **retirée** : la page n'a jamais deux titres ou deux `og:image`. Les balises que la page ne redéfinit pas sont conservées.

Balises qui peuvent être retirées ainsi :

- `<title>` ;
- `<meta name="...">` et `<meta property="...">` qui ont le même nom ou la même propriété qu'une nouvelle balise ;
- `<link rel="canonical">`, `<link rel="icon">`, `<link rel="shortcut icon">` ;
- `<script type="application/ld+json">` ajoutés par le package lui-même (avec l'attribut `data-spa-meta-tags`). Vos propres scripts ne sont jamais retirés.

Tout le reste est conservé : charset, viewport, styles, liens de préchargement, scripts de statistiques, etc. Seul le `<head>` est modifié, jamais le `<body>`.

Pour garder toutes les balises du template et seulement ajouter les nouvelles, utilisez [`replaceExisting: false`](../reference/options#replaceexisting).

## Écrire les balises Twitter avec `name` {#write-the-twitter-tags-with-name}

Les balises Twitter standard utilisent `name`, pas `property` :

```html
<!-- Correct -->
<meta name="twitter:title" content="My Store" />

<!-- Pas retirée quand la page définit son propre titre Twitter -->
<meta property="twitter:title" content="My Store" />
```

Le package écrit `name="twitter:..."`. Pour lui, une balise du template écrite avec `property="twitter:..."` est une autre balise : la page contiendrait les deux. Corrigez votre template s'il utilise `property` pour les balises Twitter. Les balises `og:`, elles, utilisent bien `property`.

## À éviter dans le template {#things-to-avoid-in-the-template}

- **Un `>` à l'intérieur d'un attribut d'une balise que la page redéfinit**, par exemple `<meta name="description" content="a > b">`. Le package repère les balises avec un motif simple qui s'arrête au premier `>`, et un morceau de la balise resterait dans la page. Écrivez `&gt;` à la place.
- **Des balises dans un commentaire HTML ou dans un script du `<head>`** : elles sont vues comme de vraies balises.

Ces limites viennent du fait que le template est traité avec des motifs rapides plutôt qu'avec un véritable analyseur HTML, ce qui garde le package sans dépendance. Un `index.html` classique généré par Vite n'est pas concerné.
