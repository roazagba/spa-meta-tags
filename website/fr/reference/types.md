# Types

Le package est écrit en TypeScript et fournit ses types, pour `import` comme pour `require`. Tous les types sont exportés depuis la racine du package :

```ts
import type {
  SeoData, SeoContext, SeoResolver, SeoTag,
  MetaTag, LinkTag, RequestLike, ResponseLike,
  SeoRenderer, SeoRendererOptions, SeoMiddlewareOptions,
} from 'spa-meta-tags'
```

## `SeoData`

Voir [Données SEO](./seo-data).

## `SeoContext`

```ts
interface SeoContext<Req extends RequestLike = RequestLike> {
  req: Req
  url: URL
  path: string
  query: URLSearchParams
  origin: string
  host: string
  isBot: boolean
}
```

## `SeoResolver`

```ts
type SeoResolver<Req extends RequestLike = RequestLike> =
  (context: SeoContext<Req>) => SeoData | null | undefined | Promise<SeoData | null | undefined>
```

## `MetaTag` et `LinkTag`

```ts
type MetaTag = { name: string, content: string } | { property: string, content: string }

interface LinkTag {
  rel: string
  href: string
  [attribute: string]: string
}
```

## `SeoTag`

La représentation interne d'une balise, renvoyée par `buildSeoTags` et acceptée par `renderSeoTags` et `injectSeoTags`.

```ts
type SeoTag =
  | { tag: 'title', content: string }
  | { tag: 'meta' | 'link', attrs: Record<string, string> }
  | { tag: 'script', attrs: Record<string, string>, content: string }
```

Vous pouvez ajouter vos propres balises à la liste avant de l'écrire :

```ts
const tags = buildSeoTags(data)
tags.push({ tag: 'meta', attrs: { name: 'author', content: 'Jane Doe' } })
const page = injectSeoTags(template, tags)
```

## `RequestLike` et `ResponseLike`

Les plus petites interfaces de requête et de réponse dont le package a besoin. `http.IncomingMessage`, `http.ServerResponse` et les objets d'Express y correspondent.

```ts
interface RequestLike {
  url?: string
  originalUrl?: string
  method?: string
  headers: Record<string, string | string[] | undefined>
  socket?: object | null
}

interface ResponseLike {
  statusCode: number
  setHeader: (name: string, value: string) => unknown
  end: (body?: string) => unknown
}
```

## Typer votre propre requête

Les fonctions sont génériques sur le type de la requête : le resolver reçoit votre type de requête dans `context.req`.

```ts
import type { Request } from 'express'
import { createSeoMiddleware } from 'spa-meta-tags'

app.use(createSeoMiddleware<Request>({
  template,
  resolve: ({ req }) => ({ title: req.hostname }), // req est une Request Express
}))
```
