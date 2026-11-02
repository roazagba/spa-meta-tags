# AI visibility

AI assistants and AI search engines (ChatGPT, Claude, Perplexity, Google AI, etc.) read your site like crawlers do. Most of them do not run JavaScript: on a SPA, they only see the initial `index.html`.

spa-meta-tags helps in four ways.

## 1. Every page has its own tags

The server injects the title, description, canonical link and [JSON-LD](./structured-data) in the HTML of each page. An AI crawler that does not run JavaScript therefore reads the right content for every URL, not the same default page.

AI crawlers are detected as bots, so [`botsOnly`](../reference/options) also serves them the page data.

## 2. Detect AI crawlers

`context.isAiBot` is `true` when the request comes from an AI crawler. These requests are also counted in `isBot`.

```js
resolve: async ({ isAiBot, path }) => {
  const page = await getPage(path)

  return {
    title: page.title,
    // More complete structured data for AI crawlers only
    jsonLd: isAiBot ? page.fullJsonLd : page.jsonLd,
  }
}
```

`isAiBot(userAgent)` is also exported, as well as the list of known crawlers, `aiBots`:

```js
import { aiBots, isAiBot } from 'spa-meta-tags'

isAiBot('Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)') // true
aiBots.filter(bot => bot.kind === 'search') // OAI-SearchBot, Claude-SearchBot, PerplexityBot
```

Each crawler has a `kind`:

| Kind | Role | Examples |
|---|---|---|
| `training` | Collects content to train models | `GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `Bytespider` |
| `search` | Indexes content for AI search and answers | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot` |
| `user` | Fetches a page when a person asks the assistant for it | `ChatGPT-User`, `Claude-User`, `Perplexity-User` |

::: info
`Google-Extended` and `Applebot-Extended` are `robots.txt` tokens only: they never appear in a user agent, so `isAiBot` cannot detect them. They are in `aiBots` so `buildRobotsTxt` can write them.
:::

## 3. Choose who can read your site: `robots.txt`

`buildRobotsTxt(options)` returns the content of a `robots.txt`, with a policy by kind of AI crawler.

```js
import { buildRobotsTxt } from 'spa-meta-tags'

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(buildRobotsTxt({
    disallow: ['/admin'],
    sitemaps: 'https://example.com/sitemap.xml',
    // Not used for training, but visible in AI search and answers
    ai: { training: false, search: true, user: true },
  }))
})
```

Result:

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

For each kind in `ai`, `false` blocks the whole site, `true` allows it explicitly (even the paths blocked for every crawler), and a kind left out follows the rules of `User-agent: *`.

`robots.txt` is a request, not a protection: serious crawlers respect it, others do not.

## 4. Describe your site: `llms.txt`

[`/llms.txt`](https://llmstxt.org) is a Markdown file at the root of the site that gives AI tools a summary and the useful links, instead of making them parse the whole site.

```js
import { buildLlmsTxt } from 'spa-meta-tags'

app.get('/llms.txt', (req, res) => {
  res.type('text/markdown').send(buildLlmsTxt({
    title: 'My Shop',
    description: 'Online shop of handmade bags, delivered in Benin.',
    details: 'Prices are in CFA francs.',
    sections: [
      {
        title: 'Pages',
        links: [
          { title: 'Catalog', url: 'https://example.com/catalog', description: 'All the products' },
          { title: 'Delivery', url: 'https://example.com/delivery' },
        ],
      },
      { title: 'More', optional: true, links: [{ title: 'Blog', url: 'https://example.com/blog' }] },
    ],
  }))
})
```

Result:

```md
# My Shop

> Online shop of handmade bags, delivered in Benin.

Prices are in CFA francs.

## Pages
- [Catalog](https://example.com/catalog): All the products
- [Delivery](https://example.com/delivery)

## Optional
- [Blog](https://example.com/blog)
```

A section with `optional: true` is written last, under the title `Optional`, which tells AI tools they can skip it when their context is short. Use a single one.

## Static hosting

Without a Node server, write the files at build time, for example in your Vite plugin or build script:

```js
import { writeFileSync } from 'node:fs'
import { buildLlmsTxt, buildRobotsTxt } from 'spa-meta-tags'

writeFileSync('dist/robots.txt', buildRobotsTxt({ ai: { training: false } }))
writeFileSync('dist/llms.txt', buildLlmsTxt({ title: 'My Site', sections: [] }))
```

## What these files do not do

No tool can promise that an AI assistant will quote your site. These features make the content readable and the rules clear: the choice to use it belongs to each AI provider.
