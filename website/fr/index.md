---
layout: home

hero:
  name: spa-meta-tags
  text: Aperçus de liens et SEO pour les applications SPA
  tagline: Donnez à chaque page de votre application Vue, React ou Svelte son propre titre, sa description et son image sur WhatsApp, Facebook, X et LinkedIn. Sans réécrire en SSR.
  actions:
    - theme: brand
      text: Premiers pas
      link: /fr/guide/getting-started
    - theme: alt
      text: Pourquoi spa-meta-tags
      link: /fr/guide/introduction
    - theme: alt
      text: Voir sur GitHub
      link: https://github.com/roazagba/spa-meta-tags

features:
  - title: Fonctionne avec votre SPA actuelle
    details: Votre application ne change pas. Le serveur Node qui la sert injecte les bonnes balises dans index.html pour chaque page.
  - title: N'importe quel serveur Node
    details: Un middleware pour Express, Connect ou le serveur http de Node, et des fonctions de base utilisables dans tout autre serveur ou rendu SSR.
  - title: Aussi en hébergement statique
    details: "Pas de serveur Node ? Générez une page HTML par route au moment du build. Fonctionne avec n'importe quel hébergement statique : Vercel, Netlify, Cloudflare Pages, GitHub Pages, un hébergement mutualisé, S3, et bien d'autres."
  - title: Sûr et robuste
    details: Toutes les valeurs sont échappées. Si votre API est lente ou en panne, la page est servie avec vos balises par défaut.
  - title: Aucune dépendance
    details: Léger, écrit uniquement avec la bibliothèque standard de Node. ESM et CommonJS, avec les types TypeScript.
  - title: Prêt pour le multi-clients
    details: Une boutique ou un client par sous-domaine ? Le resolver connaît le domaine de chaque visiteur, et le cache est séparé par domaine.
---
