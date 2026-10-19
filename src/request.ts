import type { RequestLike, SeoContext } from './types'

const bot_regex = new RegExp([
  // Social networks and messaging apps (link previews)
  'facebookexternalhit', 'facebookcatalog', 'facebot', 'meta-externalagent', 'whatsapp', 'twitterbot',
  'linkedinbot', 'slackbot', 'telegrambot', 'discordbot', 'pinterest', 'skypeuripreview', 'redditbot',
  'snapchat', 'viber', 'embedly', 'iframely',
  // Search engines
  'googlebot', 'google-inspectiontool', 'bingbot', 'yandex', 'baiduspider', 'duckduckbot', 'applebot',
  'qwantify', 'ecosia',
  // Generic
  'bot\\b', 'crawler', 'spider', 'preview',
].join('|'), 'i')

/**
 * True when the user agent is a crawler (social network preview, search engine, etc.)
 */
export function isBot (user_agent?: string | null): boolean {
  return !!user_agent && bot_regex.test(user_agent)
}

function header (req: RequestLike, name: string): string | undefined {
  const value = req.headers[name]
  const first = Array.isArray(value) ? value[0] : value
  // Proxies can chain values: "https, http"
  return first?.split(',', 1)[0]?.trim() || undefined
}

export interface OriginOptions {
  /** Reads `X-Forwarded-Proto` and `X-Forwarded-Host` set by the reverse proxy. Defaults to true */
  trustProxy?: boolean
}

/**
 * Origin of the visitor (`https://shop.example.com`), as seen behind the reverse proxy
 */
export function getRequestOrigin (req: RequestLike, options: OriginOptions = {}): string {
  const { trustProxy = true } = options

  const protocol = (trustProxy && header(req, 'x-forwarded-proto'))
    || ((req.socket as { encrypted?: boolean } | null | undefined)?.encrypted ? 'https' : 'http')
  const host = (trustProxy && header(req, 'x-forwarded-host')) || header(req, 'host') || 'localhost'

  return `${protocol}://${host}`
}

/**
 * Builds the context given to the resolver
 */
export function createSeoContext<Req extends RequestLike> (req: Req, options: OriginOptions = {}): SeoContext<Req> {
  const origin = getRequestOrigin(req, options)
  const url = new URL(req.originalUrl ?? req.url ?? '/', origin)

  return {
    req,
    url,
    path: url.pathname,
    query: url.searchParams,
    origin,
    host: url.host,
    isBot: isBot(header(req, 'user-agent')),
  }
}
