---
layout: home

hero:
  name: spa-meta-tags
  text: Link previews and SEO for single-page applications
  tagline: Give every page of your Vue, React or Svelte app its own title, description and image on WhatsApp, Facebook, X and LinkedIn. No SSR rewrite.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Why spa-meta-tags
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/roazagba/spa-meta-tags

features:
  - title: Works with your existing SPA
    details: Keep your app as it is. The Node server that serves it injects the right tags in index.html for each page.
  - title: Any Node server
    details: An Express, Connect or Node http middleware, plus core functions you can call from any other server or SSR setup.
  - title: Static hosting too
    details: "No Node server? Generate one HTML page per route at build time. Works with any static host: Vercel, Netlify, Cloudflare Pages, GitHub Pages, shared hosting, S3, and more."
  - title: Safe and resilient
    details: Every value is escaped. If your API is slow or down, the page is still served with your default tags.
  - title: Zero dependencies
    details: Small, written with the Node standard library only. ESM and CommonJS, with TypeScript types.
  - title: Multi-tenant ready
    details: One store or customer per subdomain? The resolver knows the host of each visitor, and the cache is kept per host.
---
