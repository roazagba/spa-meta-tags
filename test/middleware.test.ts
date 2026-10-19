import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSeoMiddleware, isPageRequest } from '../src'

const template = '<html><head><title>My Site</title><!--seo-head--></head><body><div id="app"></div></body></html>'

let server: Server | undefined

afterEach(() => {
  server?.close()
  server = undefined
})

async function start (middleware: ReturnType<typeof createSeoMiddleware>) {
  server = createServer((req, res) => middleware(req, res))
  await new Promise<void>(resolve => server!.listen(0, '127.0.0.1', resolve))
  return `http://127.0.0.1:${(server!.address() as AddressInfo).port}`
}

describe('createSeoMiddleware', () => {
  it('serves the page with the SEO tags on a Node http server', async () => {
    const resolve = vi.fn(({ host, path }) => ({ title: `${host} ${path}` }))
    const base_url = await start(createSeoMiddleware({ template, resolve }))

    const response = await fetch(`${base_url}/product`, {
      headers: { 'Accept': 'text/html', 'X-Forwarded-Host': 'shop.example.com', 'X-Forwarded-Proto': 'https' },
    })
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(html).toContain('<title>shop.example.com /product</title>')
    expect(html).toContain('<meta property="og:url" content="https://shop.example.com/product">')
    expect(html).toContain('<div id="app"></div>')
  })

  it('applies transformHtml and reads the template on each request', async () => {
    const read_template = vi.fn(() => template)
    const base_url = await start(createSeoMiddleware({
      template: read_template,
      transformHtml: html => html.replace('<body>', '<body><script src="/@vite/client"></script>'),
      resolve: () => ({ title: 'Store' }),
    }))

    await fetch(`${base_url}/`)
    const html = await (await fetch(`${base_url}/`)).text()

    expect(read_template).toHaveBeenCalledTimes(2)
    expect(html).toContain('/@vite/client')
  })

  it('calls next for the requests it does not handle', () => {
    const next = vi.fn()
    const resolve = vi.fn()
    const middleware = createSeoMiddleware({ template, resolve })

    middleware({ url: '/assets/app.js', method: 'GET', headers: {} }, { statusCode: 200, setHeader: vi.fn(), end: vi.fn() }, next)

    expect(next).toHaveBeenCalledWith()
    expect(resolve).not.toHaveBeenCalled()
  })

  it('passes the template errors to next', async () => {
    const next = vi.fn()
    const middleware = createSeoMiddleware({
      template: () => {
        throw new Error('index.html not found')
      },
      resolve: () => null,
    })

    middleware({ url: '/', method: 'GET', headers: {} }, { statusCode: 200, setHeader: vi.fn(), end: vi.fn() }, next)

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(expect.any(Error)))
  })
})

describe('isPageRequest', () => {
  it('accepts the page navigations', () => {
    expect(isPageRequest({ url: '/product?ref=wa', method: 'GET', headers: { accept: 'text/html,*/*' } })).toBe(true)
    expect(isPageRequest({ url: '/', method: 'HEAD', headers: {} })).toBe(true)
  })

  it('rejects the assets, the API calls and the other methods', () => {
    expect(isPageRequest({ url: '/robots.txt', method: 'GET', headers: {} })).toBe(false)
    expect(isPageRequest({ url: '/api/products', method: 'GET', headers: { accept: 'application/json' } })).toBe(false)
    expect(isPageRequest({ url: '/', method: 'POST', headers: {} })).toBe(false)
  })
})
