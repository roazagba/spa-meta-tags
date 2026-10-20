# Why spa-meta-tags

## The problem

When someone shares a link on WhatsApp, Facebook, X or LinkedIn, the platform sends a crawler to the page. The crawler reads the tags in the `<head>` of the HTML (`<title>`, `og:title`, `og:description`, `og:image`, etc.) and builds the preview card from them.

A single-page application builds its content in the browser, with JavaScript. Link preview crawlers **do not run JavaScript**: they only read the HTML sent by the server. For a SPA, that HTML is always the same `index.html`:

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

So every link of your site gets the same preview: same title, no description, no product image. Tags added later by JavaScript (with `useHead`, `react-helmet`, `document.title`, etc.) are never seen by these crawlers.

## The usual solutions

| Solution | Downside |
|---|---|
| Rewrite the app with SSR (Nuxt, Next.js, SvelteKit) | Large migration, different architecture, more server resources |
| Prerendering service | Paid service or headless browser to run, cache to manage |
| Prerender at build time | Only works for pages known at build time |

## What spa-meta-tags does

`spa-meta-tags` only fixes the `<head>`, which is all the crawlers need:

1. a request for a page arrives on the Node server that serves your SPA;
2. you write a small function, the **resolver**, that returns the title, description and image of that page, usually from your API;
3. the package turns this data into tags and injects them in `index.html`;
4. the page is sent. The SPA boots in the browser exactly as before.

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

Your app does not change. You add a few lines to the server, or a plugin to the build if your site is hosted as static files.

## When to use it

- Your app is a SPA (Vue, React, Svelte, Solid, etc.) built with Vite or another bundler.
- You want good link previews and better SEO for pages whose content comes from an API: products, articles, profiles, events.
- You serve the app with Node (Express or another server), **or** you host it as static files and your pages are known at build time.

## When not to use it

- Your app already uses SSR (Nuxt, Next.js, SvelteKit, Remix): use the head management of your framework.
- You need crawlers to see the **content** of the page, not only the head (full text indexing of a SPA). The package only handles the tags of the `<head>`. Search engines like Google do run JavaScript, but crawlers of social networks do not.

Next: [Getting started](./getting-started).
