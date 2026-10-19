/**
 * SEO data of a page, used to build the title, meta, Open Graph and Twitter tags.
 * Every field is optional: missing fields are taken from the defaults, or not rendered.
 */
export interface SeoData {
  /** Page title (`<title>`, `og:title`, `twitter:title`) */
  title?: string
  /** Description, HTML allowed: it is converted to plain text and truncated */
  description?: string
  /** Absolute URL of the preview image */
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  /** Absolute URL of the page (`og:url`). Defaults to the requested URL without query string */
  url?: string
  /** Canonical URL. Defaults to `url`, `false` to disable it */
  canonical?: string | false
  /** `og:type` (website, product, article...). Defaults to `website` */
  type?: string
  siteName?: string
  /** `og:locale`, for example `fr_FR` */
  locale?: string
  /** Defaults to `summary_large_image` when an image is set, otherwise `summary` */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  /** Twitter / X account of the site, for example `@monsite` */
  twitterSite?: string
  /** Absolute URL of the favicon */
  favicon?: string
  /** `robots` meta, for example `noindex, nofollow` */
  robots?: string
  /** Additional meta tags */
  meta?: MetaTag[]
  /** Additional link tags */
  links?: LinkTag[]
  /** Structured data (schema.org), rendered as `application/ld+json` scripts */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
  /** HTTP status of the response (for example 404 for a missing product). Not rendered */
  status?: number
}

export type MetaTag = { name: string, content: string } | { property: string, content: string }

export interface LinkTag {
  rel: string
  href: string
  [attribute: string]: string
}

/** Tag ready to be rendered or injected in the HTML */
export type SeoTag =
  | { tag: 'title', content: string }
  | { tag: 'meta' | 'link', attrs: Record<string, string> }
  | { tag: 'script', attrs: Record<string, string>, content: string }

/** Minimal request interface: compatible with Node `http`, Express, Connect... */
export interface RequestLike {
  url?: string
  /** Express: URL before the mount path is removed */
  originalUrl?: string
  method?: string
  headers: Record<string, string | string[] | undefined>
  /** TLS sockets have `encrypted: true` */
  socket?: object | null
}

/** Minimal response interface: compatible with Node `http`, Express, Connect... */
export interface ResponseLike {
  statusCode: number
  setHeader: (name: string, value: string) => unknown
  end: (body?: string) => unknown
}

export interface SeoContext<Req extends RequestLike = RequestLike> {
  req: Req
  /** Full requested URL */
  url: URL
  /** Requested path, for example `/mon-produit` */
  path: string
  query: URLSearchParams
  /** Origin of the visitor, for example `https://shop.example.com` */
  origin: string
  /** Host of the visitor, for example `shop.example.com` */
  host: string
  /** True when the request comes from a crawler (WhatsApp, Facebook, Google...) */
  isBot: boolean
}

export type SeoResolver<Req extends RequestLike = RequestLike> =
  (context: SeoContext<Req>) => SeoData | null | undefined | Promise<SeoData | null | undefined>
