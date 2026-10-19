import type { RequestLike, ResponseLike } from './types'
import { createSeoRenderer, type SeoRendererOptions } from './renderer'

export interface SeoMiddlewareOptions<Req extends RequestLike = RequestLike> extends SeoRendererOptions<Req> {
  /** HTML page of the SPA (`index.html`), or a function returning it (read on each request in development) */
  template: string | ((req: Req) => string | Promise<string>)
  /** Transforms the template before the injection, for example `vite.transformIndexHtml` in development */
  transformHtml?: (html: string, req: Req) => string | Promise<string>
  /** Requests handled by the middleware. Defaults to GET/HEAD page requests (no file extension) accepting HTML */
  shouldHandle?: (req: Req) => boolean
  /** `Cache-Control` header of the HTML response. Defaults to `no-cache` */
  cacheControl?: string | false
}

type Next = (error?: unknown) => void

/**
 * Default filter: page navigations only (not the assets, the API...)
 */
export function isPageRequest (req: RequestLike): boolean {
  if (req.method && !['GET', 'HEAD'].includes(req.method.toUpperCase())) return false

  const path = (req.originalUrl ?? req.url ?? '/').split('?', 1)[0] ?? '/'
  // Assets: /assets/app.js, /favicon.png, /robots.txt...
  if (/\.[a-z\d]+$/i.test(path)) return false

  const accept = req.headers.accept
  const accept_value = Array.isArray(accept) ? accept.join(',') : accept
  return !accept_value || accept_value.includes('text/html') || accept_value.includes('*/*')
}

/**
 * Express / Connect / Node `http` middleware serving the SPA page with its SEO tags.
 * Place it after the static files middleware: it replaces the "fallback to index.html".
 */
export function createSeoMiddleware<Req extends RequestLike = RequestLike, Res extends ResponseLike = ResponseLike> (
  options: SeoMiddlewareOptions<Req>,
) {
  const { template, transformHtml, shouldHandle = isPageRequest, cacheControl = 'no-cache' } = options
  const renderer = createSeoRenderer(options)

  async function handle (req: Req, res: Res) {
    let html = typeof template == 'function' ? await template(req) : template

    if (transformHtml) {
      html = await transformHtml(html, req)
    }

    const rendered = await renderer.render(req, html)

    res.statusCode = rendered.status
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    if (cacheControl) {
      res.setHeader('Cache-Control', cacheControl)
    }

    res.end(req.method?.toUpperCase() == 'HEAD' ? undefined : rendered.html)
  }

  const middleware = (req: Req, res: Res, next?: Next) => {
    if (!shouldHandle(req)) {
      if (next) {
        next()
      } else {
        res.statusCode = 404
        res.end()
      }
      return
    }

    handle(req, res).catch(error => {
      if (next) {
        next(error)
      } else {
        res.statusCode = 500
        res.end()
      }
    })
  }

  return Object.assign(middleware, { renderer })
}
