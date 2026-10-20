import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitepress'

// Version shown in the menu, read from the package
const { version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))

const github = 'https://github.com/roazagba/spa-meta-tags'
const npm = 'https://www.npmjs.com/package/spa-meta-tags'

/**
 * Pages of the site, shared by every language. `prefix` is '' for English and '/fr' for French.
 */
function sidebar (prefix, t) {
  return {
    [`${prefix}/guide/`]: [
      {
        text: t.introduction,
        items: [
          { text: t.why, link: `${prefix}/guide/introduction` },
          { text: t.gettingStarted, link: `${prefix}/guide/getting-started` },
          { text: t.howItWorks, link: `${prefix}/guide/how-it-works` },
        ],
      },
      {
        text: t.setup,
        items: [
          { text: 'Express', link: `${prefix}/guide/express` },
          { text: t.nodeHttp, link: `${prefix}/guide/node-http` },
          { text: t.viteDev, link: `${prefix}/guide/vite-dev` },
          { text: t.staticHosting, link: `${prefix}/guide/static-hosting` },
        ],
      },
      {
        text: t.writingSeo,
        items: [
          { text: t.resolver, link: `${prefix}/guide/resolver` },
          { text: t.template, link: `${prefix}/guide/template` },
          { text: t.multiTenant, link: `${prefix}/guide/multi-tenant` },
          { text: t.structuredData, link: `${prefix}/guide/structured-data` },
        ],
      },
      {
        text: t.production,
        items: [
          { text: t.checklist, link: `${prefix}/guide/production` },
          { text: t.performance, link: `${prefix}/guide/performance` },
          { text: t.testing, link: `${prefix}/guide/testing-previews` },
          { text: t.troubleshooting, link: `${prefix}/guide/troubleshooting` },
        ],
      },
    ],
    [`${prefix}/reference/`]: [
      {
        text: t.reference,
        items: [
          { text: t.seoData, link: `${prefix}/reference/seo-data` },
          { text: t.generatedTags, link: `${prefix}/reference/generated-tags` },
          { text: t.options, link: `${prefix}/reference/options` },
          { text: t.functions, link: `${prefix}/reference/functions` },
          { text: t.types, link: `${prefix}/reference/types` },
        ],
      },
    ],
    [`${prefix}/examples/`]: [
      {
        text: t.examples,
        items: [
          { text: t.ecommerce, link: `${prefix}/examples/e-commerce` },
          { text: t.blog, link: `${prefix}/examples/blog` },
          { text: 'React Router', link: `${prefix}/examples/react-router` },
        ],
      },
    ],
  }
}

function nav (prefix, t) {
  return [
    { text: t.guide, link: `${prefix}/guide/introduction`, activeMatch: `${prefix}/guide/` },
    { text: t.reference, link: `${prefix}/reference/seo-data`, activeMatch: `${prefix}/reference/` },
    { text: t.examples, link: `${prefix}/examples/e-commerce`, activeMatch: `${prefix}/examples/` },
    {
      text: `v${version}`,
      items: [
        { text: t.changelog, link: `${github}/releases` },
        { text: 'npm', link: npm },
      ],
    },
  ]
}

const en = {
  guide: 'Guide',
  reference: 'Reference',
  examples: 'Examples',
  changelog: 'Changelog',
  introduction: 'Introduction',
  why: 'Why spa-meta-tags',
  gettingStarted: 'Getting started',
  howItWorks: 'How it works',
  setup: 'Setup',
  nodeHttp: 'Node http and other servers',
  viteDev: 'Development with Vite',
  staticHosting: 'Static hosting',
  writingSeo: 'Writing SEO data',
  resolver: 'The resolver',
  template: 'The HTML template',
  multiTenant: 'One site per subdomain',
  structuredData: 'Structured data (JSON-LD)',
  production: 'Going to production',
  checklist: 'Production checklist',
  performance: 'Performance and caching',
  testing: 'Testing link previews',
  troubleshooting: 'Troubleshooting',
  seoData: 'SEO data',
  generatedTags: 'Generated tags',
  options: 'Options',
  functions: 'Functions',
  types: 'Types',
  ecommerce: 'E-commerce, one store per subdomain',
  blog: 'Blog with an API',
}

const fr = {
  guide: 'Guide',
  reference: 'Référence',
  examples: 'Exemples',
  changelog: 'Versions',
  introduction: 'Introduction',
  why: 'Pourquoi spa-meta-tags',
  gettingStarted: 'Premiers pas',
  howItWorks: 'Fonctionnement',
  setup: 'Installation',
  nodeHttp: 'Node http et autres serveurs',
  viteDev: 'Développement avec Vite',
  staticHosting: 'Hébergement statique',
  writingSeo: 'Écrire les données SEO',
  resolver: 'Le resolver',
  template: 'Le template HTML',
  multiTenant: 'Un site par sous-domaine',
  structuredData: 'Données structurées (JSON-LD)',
  production: 'Mise en production',
  checklist: 'Liste de contrôle',
  performance: 'Performances et cache',
  testing: 'Tester les aperçus',
  troubleshooting: 'Dépannage',
  seoData: 'Données SEO',
  generatedTags: 'Balises générées',
  options: 'Options',
  functions: 'Fonctions',
  types: 'Types',
  ecommerce: 'E-commerce, une boutique par sous-domaine',
  blog: 'Blog avec une API',
}

export default defineConfig({
  title: 'spa-meta-tags',

  // Served from https://roazagba.github.io/spa-meta-tags/
  base: '/spa-meta-tags/',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'spa-meta-tags' }],
    ['meta', { property: 'og:description', content: 'Link previews and SEO for single-page applications, without SSR.' }],
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      description: 'Server-side meta tags for single-page applications: SEO and link previews on WhatsApp, Facebook, X and LinkedIn.',
      themeConfig: {
        nav: nav('', en),
        sidebar: sidebar('', en),
        editLink: { pattern: `${github}/edit/main/website/:path`, text: 'Edit this page on GitHub' },
      },
    },
    fr: {
      label: 'Français',
      lang: 'fr-FR',
      link: '/fr/',
      description: 'Balises meta côté serveur pour les applications SPA : SEO et aperçus de liens sur WhatsApp, Facebook, X et LinkedIn.',
      themeConfig: {
        nav: nav('/fr', fr),
        sidebar: sidebar('/fr', fr),
        editLink: { pattern: `${github}/edit/main/website/:path`, text: 'Modifier cette page sur GitHub' },
        outline: { label: 'Sur cette page' },
        docFooter: { prev: 'Page précédente', next: 'Page suivante' },
        lastUpdated: { text: 'Mis à jour le' },
        returnToTopLabel: 'Retour en haut',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Apparence',
        lightModeSwitchTitle: 'Passer au thème clair',
        darkModeSwitchTitle: 'Passer au thème sombre',
        langMenuLabel: 'Changer de langue',
        notFound: {
          title: 'Page introuvable',
          quote: 'Cette page n\'existe pas ou a été déplacée.',
          linkLabel: 'Aller à l\'accueil',
          linkText: 'Retour à l\'accueil',
        },
        footer: {
          message: 'Publié sous licence MIT.',
          copyright: 'Copyright © 2026 <a href="https://roazagba.me">Roméo AZAGBA</a>',
        },
      },
    },
  },

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: github },
      { icon: 'npm', link: npm },
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          fr: {
            translations: {
              button: { buttonText: 'Rechercher', buttonAriaLabel: 'Rechercher' },
              modal: {
                displayDetails: 'Afficher la liste détaillée',
                resetButtonTitle: 'Effacer la recherche',
                backButtonTitle: 'Fermer la recherche',
                noResultsText: 'Aucun résultat pour',
                footer: {
                  selectText: 'pour choisir',
                  navigateText: 'pour naviguer',
                  closeText: 'pour fermer',
                },
              },
            },
          },
        },
      },
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 <a href="https://roazagba.me">Roméo AZAGBA</a>',
    },
  },
})
