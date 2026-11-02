# Visibilité auprès des IA

Les assistants IA et les moteurs de recherche IA (ChatGPT, Claude, Perplexity, Google AI, etc.) lisent votre site comme des robots. La plupart n'exécutent pas le JavaScript : sur une SPA, ils ne voient que le `index.html` de départ.

spa-meta-tags aide de quatre façons.

## 1. Chaque page a ses propres balises

Le serveur injecte le titre, la description, le lien canonique et le [JSON-LD](./structured-data) dans le HTML de chaque page. Un robot d'IA qui n'exécute pas le JavaScript lit donc le bon contenu pour chaque URL, et non la même page par défaut.

Les robots d'IA sont détectés comme des robots : l'option [`botsOnly`](../reference/options) leur sert donc aussi les données de la page.

## 2. Détecter les robots d'IA

`context.isAiBot` vaut `true` quand la requête vient d'un robot d'IA. Ces requêtes sont aussi comptées dans `isBot`.

```js
resolve: async ({ isAiBot, path }) => {
  const page = await getPage(path)

  return {
    title: page.title,
    // Données structurées plus complètes, pour les robots d'IA seulement
    jsonLd: isAiBot ? page.fullJsonLd : page.jsonLd,
  }
}
```

`isAiBot(userAgent)` est aussi exportée, ainsi que la liste des robots connus, `aiBots` :

```js
import { aiBots, isAiBot } from 'spa-meta-tags'

isAiBot('Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)') // true
aiBots.filter(bot => bot.kind === 'search') // OAI-SearchBot, Claude-SearchBot, PerplexityBot
```

Chaque robot a un `kind` :

| Type | Rôle | Exemples |
|---|---|---|
| `training` | Collecte du contenu pour entraîner des modèles | `GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `Bytespider` |
| `search` | Indexe le contenu pour la recherche et les réponses IA | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot` |
| `user` | Charge une page quand une personne la demande à l'assistant | `ChatGPT-User`, `Claude-User`, `Perplexity-User` |

::: info
`Google-Extended` et `Applebot-Extended` sont uniquement des jetons de `robots.txt` : ils n'apparaissent jamais dans un user agent, donc `isAiBot` ne peut pas les détecter. Ils sont dans `aiBots` pour que `buildRobotsTxt` puisse les écrire.
:::

## 3. Choisir qui peut lire votre site : `robots.txt`

`buildRobotsTxt(options)` renvoie le contenu d'un `robots.txt`, avec une politique par type de robot d'IA.

```js
import { buildRobotsTxt } from 'spa-meta-tags'

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(buildRobotsTxt({
    disallow: ['/admin'],
    sitemaps: 'https://example.com/sitemap.xml',
    // Pas d'entraînement, mais visible dans la recherche et les réponses IA
    ai: { training: false, search: true, user: true },
  }))
})
```

Résultat :

```txt
User-agent: *
Disallow: /admin

User-agent: GPTBot
User-agent: ClaudeBot
User-agent: anthropic-ai
(...)
Disallow: /

User-agent: OAI-SearchBot
User-agent: Claude-SearchBot
User-agent: PerplexityBot
Allow: /

User-agent: ChatGPT-User
User-agent: Claude-User
(...)
Allow: /

Sitemap: https://example.com/sitemap.xml
```

Pour chaque type dans `ai`, `false` bloque tout le site, `true` l'autorise explicitement (même les chemins bloqués pour tous les robots), et un type absent suit les règles de `User-agent: *`.

`robots.txt` est une demande, pas une protection : les robots sérieux la respectent, les autres non.

## 4. Décrire votre site : `llms.txt`

[`/llms.txt`](https://llmstxt.org) est un fichier Markdown à la racine du site. Il donne aux outils d'IA un résumé et les liens utiles, au lieu de leur faire analyser tout le site.

```js
import { buildLlmsTxt } from 'spa-meta-tags'

app.get('/llms.txt', (req, res) => {
  res.type('text/markdown').send(buildLlmsTxt({
    title: 'Ma boutique',
    description: 'Boutique en ligne de sacs artisanaux, livrés au Bénin.',
    details: 'Les prix sont en francs CFA.',
    sections: [
      {
        title: 'Pages',
        links: [
          { title: 'Catalogue', url: 'https://example.com/catalogue', description: 'Tous les produits' },
          { title: 'Livraison', url: 'https://example.com/livraison' },
        ],
      },
      { title: 'Plus', optional: true, links: [{ title: 'Blog', url: 'https://example.com/blog' }] },
    ],
  }))
})
```

Résultat :

```md
# Ma boutique

> Boutique en ligne de sacs artisanaux, livrés au Bénin.

Les prix sont en francs CFA.

## Pages
- [Catalogue](https://example.com/catalogue): Tous les produits
- [Livraison](https://example.com/livraison)

## Optional
- [Blog](https://example.com/blog)
```

Une section avec `optional: true` est écrite en dernier, sous le titre `Optional`, ce qui indique aux outils d'IA qu'ils peuvent l'ignorer quand leur contexte est court. N'en utilisez qu'une.

## Hébergement statique

Sans serveur Node, écrivez les fichiers au build, par exemple dans votre plugin Vite ou votre script de build :

```js
import { writeFileSync } from 'node:fs'
import { buildLlmsTxt, buildRobotsTxt } from 'spa-meta-tags'

writeFileSync('dist/robots.txt', buildRobotsTxt({ ai: { training: false } }))
writeFileSync('dist/llms.txt', buildLlmsTxt({ title: 'Mon site', sections: [] }))
```

## Ce que ces fichiers ne font pas

Aucun outil ne peut promettre qu'un assistant IA citera votre site. Ces fonctions rendent le contenu lisible et les règles claires : le choix de l'utiliser appartient à chaque fournisseur d'IA.
