# Types

The package is written in TypeScript and ships its types, for both `import` and `require`. All the types are exported from the package root:

```ts
import type {
  SeoData, SeoContext, SeoResolver, SeoTag,
  MetaTag, LinkTag, RequestLike, ResponseLike,
  SeoRenderer, SeoRendererOptions, SeoMiddlewareOptions,
} from 'spa-meta-tags'
```

## `SeoData`

See [SEO data](./seo-data).

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

## `MetaTag` and `LinkTag`

```ts
type MetaTag = { name: string, content: string } | { property: string, content: string }

interface LinkTag {
  rel: string
  href: string
  [attribute: string]: string
}
```

## `SeoTag`

The internal representation of a tag, returned by `buildSeoTags` and accepted by `renderSeoTags` and `injectSeoTags`.

```ts
type SeoTag =
  | { tag: 'title', content: string }
  | { tag: 'meta' | 'link', attrs: Record<string, string> }
  | { tag: 'script', attrs: Record<string, string>, content: string }
```

You can add your own tags to the list before rendering:

```ts
const tags = buildSeoTags(data)
tags.push({ tag: 'meta', attrs: { name: 'author', content: 'Jane Doe' } })
const page = injectSeoTags(template, tags)
```

## `RequestLike` and `ResponseLike`

The smallest request and response interfaces the package needs. `http.IncomingMessage`, `http.ServerResponse` and the Express objects match them.

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

## Typing your own request

The functions are generic on the request type, so the resolver receives your request type in `context.req`:

```ts
import type { Request } from 'express'
import { createSeoMiddleware } from 'spa-meta-tags'

app.use(createSeoMiddleware<Request>({
  template,
  resolve: ({ req }) => ({ title: req.hostname }), // req is an Express Request
}))
```
