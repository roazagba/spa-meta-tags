import type { BuildTagsOptions } from './tags'
import type { InjectOptions } from './inject'
import type { RequestLike, SeoContext, SeoData, SeoResolver, SeoTag } from './types'
import { createSeoContext, type OriginOptions } from './request'
import { buildSeoTags, renderSeoTags } from './tags'
import { injectSeoTags } from './inject'

export interface SeoRendererOptions<Req extends RequestLike = RequestLike>
  extends BuildTagsOptions, InjectOptions, OriginOptions {
  /** Returns the SEO data of the requested page (usually from your API) */
  resolve: SeoResolver<Req>
  /** Data used when the resolver returns nothing, fails or times out. Merged under the resolved data */
  defaults?: SeoData | ((context: SeoContext<Req>) => SeoData)
  /** Maximum time given to the resolver, in milliseconds. Defaults to 3000 */
  timeout?: number
  /** In-memory cache of the resolved data, per origin and URL. Disabled by default */
  cache?: false | {
    /** Lifetime in milliseconds */
    ttl: number
    /** Maximum number of cached pages. Defaults to 500 */
    max?: number
  }
  /** Only calls the resolver for crawlers; the other visitors get the defaults. Defaults to false */
  botsOnly?: boolean
  /** Called when the resolver fails or times out */
  onError?: (error: unknown, context: SeoContext<Req>) => void
}

export interface SeoRenderer<Req extends RequestLike = RequestLike> {
  /** SEO data of the request (defaults + resolved data) */
  getSeo: (req: Req) => Promise<SeoData>
  /** Tags of the request */
  getTags: (req: Req) => Promise<SeoTag[]>
  /** Tags of the request, as HTML */
  renderTags: (req: Req) => Promise<string>
  /** Injects the tags of the request in the HTML page */
  render: (req: Req, html: string) => Promise<{ html: string, status: number }>
  clearCache: () => void
}

export class SeoTimeoutError extends Error {
  constructor (timeout: number) {
    super(`SEO resolver timed out after ${timeout} ms`)
    this.name = 'SeoTimeoutError'
  }
}

function withTimeout<T> (promise: Promise<T>, timeout: number): Promise<T> {
  if (!timeout || timeout <= 0) return promise

  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout_promise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new SeoTimeoutError(timeout)), timeout)
  })

  return Promise.race([promise, timeout_promise]).finally(() => clearTimeout(timer))
}

/**
 * Merges the SEO data, the last ones first. Undefined values do not override the previous ones
 */
export function mergeSeo (...sources: Array<SeoData | null | undefined>): SeoData {
  const result: Record<string, unknown> = {}

  for (const source of sources) {
    for (const [key, value] of Object.entries(source ?? {})) {
      if (value !== undefined) {
        result[key] = value
      }
    }
  }

  return result as SeoData
}

/**
 * Creates a renderer which resolves the SEO data of each request and injects the tags in the HTML
 */
export function createSeoRenderer<Req extends RequestLike = RequestLike> (options: SeoRendererOptions<Req>): SeoRenderer<Req> {
  const { resolve, defaults, timeout = 3000, cache, botsOnly = false, onError } = options

  const cache_entries = new Map<string, { data: SeoData | null, expires_at: number }>()

  function readCache (key: string): SeoData | null | undefined {
    const entry = cache_entries.get(key)
    if (!entry) return undefined

    if (entry.expires_at < Date.now()) {
      cache_entries.delete(key)
      return undefined
    }

    // Least recently used first: move the entry at the end
    cache_entries.delete(key)
    cache_entries.set(key, entry)
    return entry.data
  }

  function writeCache (key: string, data: SeoData | null) {
    if (!cache) return

    cache_entries.set(key, { data, expires_at: Date.now() + cache.ttl })

    const max = cache.max ?? 500
    while (cache_entries.size > max) {
      const oldest_key = cache_entries.keys().next().value
      if (oldest_key === undefined) break
      cache_entries.delete(oldest_key)
    }
  }

  async function resolveData (context: SeoContext<Req>): Promise<SeoData | null> {
    if (botsOnly && !context.isBot) return null

    const cache_key = `${context.origin}${context.url.pathname}${context.url.search}`

    if (cache) {
      const cached = readCache(cache_key)
      if (cached !== undefined) return cached
    }

    try {
      const data = (await withTimeout(Promise.resolve(resolve(context)), timeout)) ?? null
      writeCache(cache_key, data)
      return data
    } catch (error) {
      // Not cached: the next request tries again
      onError?.(error, context)
      return null
    }
  }

  async function getSeo (req: Req): Promise<SeoData> {
    const context = createSeoContext(req, options)
    const default_data = typeof defaults == 'function' ? defaults(context) : (defaults ?? {})
    const data = await resolveData(context)

    return mergeSeo({ url: `${context.origin}${context.path}` }, default_data, data)
  }

  async function getTags (req: Req): Promise<SeoTag[]> {
    return buildSeoTags(await getSeo(req), options)
  }

  return {
    getSeo,
    getTags,
    renderTags: async req => renderSeoTags(await getTags(req)),
    render: async (req, html) => {
      const seo = await getSeo(req)
      return {
        html: injectSeoTags(html, buildSeoTags(seo, options), options),
        status: seo.status ?? 200,
      }
    },
    clearCache: () => cache_entries.clear(),
  }
}
