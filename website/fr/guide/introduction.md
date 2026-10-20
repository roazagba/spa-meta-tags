# Pourquoi spa-meta-tags

## Le problème

Quand quelqu'un partage un lien sur WhatsApp, Facebook, X ou LinkedIn, la plateforme envoie un robot sur la page. Le robot lit les balises du `<head>` du HTML (`<title>`, `og:title`, `og:description`, `og:image`, etc.) et construit la carte d'aperçu à partir d'elles.

Une application SPA construit son contenu dans le navigateur, avec JavaScript. Les robots d'aperçu de liens **n'exécutent pas le JavaScript** : ils ne lisent que le HTML envoyé par le serveur. Pour une SPA, ce HTML est toujours le même `index.html` :

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Store</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>
```

Tous les liens de votre site ont donc le même aperçu : même titre, pas de description, pas d'image de produit. Les balises ajoutées ensuite par JavaScript (avec `useHead`, `react-helmet`, `document.title`, etc.) ne sont jamais vues par ces robots.

## Les solutions habituelles

| Solution | Inconvénient |
|---|---|
| Réécrire l'application en SSR (Nuxt, Next.js, SvelteKit) | Grosse migration, architecture différente, plus de ressources serveur |
| Service de prérendu | Service payant ou navigateur sans interface à faire tourner, cache à gérer |
| Prérendu au moment du build | Ne fonctionne que pour les pages connues au moment du build |

## Ce que fait spa-meta-tags

`spa-meta-tags` corrige uniquement le `<head>`, c'est tout ce dont les robots ont besoin :

1. une requête de page arrive sur le serveur Node qui sert votre SPA ;
2. vous écrivez une petite fonction, le **resolver**, qui renvoie le titre, la description et l'image de cette page, en général depuis votre API ;
3. le package transforme ces données en balises et les injecte dans `index.html` ;
4. la page est envoyée. La SPA démarre dans le navigateur exactement comme avant.

```html
<head>
  <title>Barça 2026 Jersey | My Store</title>
  <meta name="description" content="The authentic and lightweight jersey">
  <meta property="og:type" content="product">
  <meta property="og:title" content="Barça 2026 Jersey | My Store">
  <meta property="og:description" content="The authentic and lightweight jersey">
  <meta property="og:url" content="https://shop.example.com/barca-2026-jersey">
  <meta property="og:image" content="https://cdn.example.com/jersey.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="https://shop.example.com/barca-2026-jersey">
</head>
```

Votre application ne change pas. Vous ajoutez quelques lignes au serveur, ou un plugin au build si votre site est hébergé en fichiers statiques.

## Quand l'utiliser

- Votre application est une SPA (Vue, React, Svelte, Solid, etc.) construite avec Vite ou un autre outil.
- Vous voulez de bons aperçus de liens et un meilleur référencement pour des pages dont le contenu vient d'une API : produits, articles, profils, événements.
- Vous servez l'application avec Node (Express ou un autre serveur), **ou** vous l'hébergez en fichiers statiques et vos pages sont connues au moment du build.

## Quand ne pas l'utiliser

- Votre application utilise déjà le SSR (Nuxt, Next.js, SvelteKit, Remix) : utilisez la gestion du `<head>` de votre framework.
- Vous avez besoin que les robots voient le **contenu** de la page, pas seulement le `<head>` (indexation complète du texte d'une SPA). Le package ne gère que les balises du `<head>`. Les moteurs de recherche comme Google exécutent le JavaScript, mais pas les robots des réseaux sociaux.

Suite : [Premiers pas](./getting-started).
