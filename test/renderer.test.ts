import { describe, expect, it, vi } from 'vitest'
import { createSeoRenderer, SeoTimeoutError } from '../src'

const bot_request = (url = '/product') => ({
  url,
  headers: { 'host': 'shop.example.com', 'x-forwarded-proto': 'https', 'user-agent': 'facebookexternalhit/1.1' },
})

const browser_request = (url = '/product') => ({
  url,
  headers: { 'host': 'shop.example.com', 'user-agent': 'Mozilla/5.0 Chrome/130' },
})

describe('createSeoRenderer', () => {
  it('merges the defaults, the resolved data and the page URL', async () => {
    const renderer = createSeoRenderer({
      defaults: { siteName: 'My Site', title: 'My Site', image: 'https://cdn.test/logo.png' },
      resolve: ({ path }) => ({ title: `Product ${path}`, image: undefined }),
    })

    expect(await renderer.getSeo(bot_request('/product?ref=wa'))).toEqual({
      url: 'https://shop.example.com/product',
      siteName: 'My Site',
      title: 'Product /product',
      image: 'https://cdn.test/logo.png',
    })
  })

  it('gives the context to the defaults function', async () => {
    const renderer = createSeoRenderer({
      defaults: ({ origin }) => ({ image: `${origin}/favicon.png` }),
      resolve: () => null,
    })

    expect((await renderer.getSeo(bot_request())).image).toBe('https://shop.example.com/favicon.png')
  })

  it('falls back to the defaults when the resolver fails', async () => {
    const on_error = vi.fn()
    const renderer = createSeoRenderer({
      defaults: { title: 'My Site' },
      resolve: () => {
        throw new Error('API down')
      },
      onError: on_error,
    })

    expect((await renderer.getSeo(bot_request())).title).toBe('My Site')
    expect(on_error).toHaveBeenCalledOnce()
  })

  it('falls back to the defaults when the resolver times out', async () => {
    const on_error = vi.fn()
    const renderer = createSeoRenderer({
      defaults: { title: 'My Site' },
      timeout: 20,
      resolve: () => new Promise(resolve => setTimeout(() => resolve({ title: 'Too late' }), 200)),
      onError: on_error,
    })

    expect((await renderer.getSeo(bot_request())).title).toBe('My Site')
    expect(on_error.mock.calls[0]?.[0]).toBeInstanceOf(SeoTimeoutError)
  })

  it('caches the resolved data per origin and URL', async () => {
    const resolve = vi.fn(({ host }: { host: string }) => ({ title: host }))
    const renderer = createSeoRenderer({ resolve, cache: { ttl: 60_000 } })

    await renderer.getSeo(bot_request('/a'))
    await renderer.getSeo(bot_request('/a'))
    await renderer.getSeo(bot_request('/b'))
    expect(resolve).toHaveBeenCalledTimes(2)

    renderer.clearCache()
    await renderer.getSeo(bot_request('/a'))
    expect(resolve).toHaveBeenCalledTimes(3)
  })

  it('evicts the oldest entries', async () => {
    const resolve = vi.fn(() => ({ title: 'x' }))
    const renderer = createSeoRenderer({ resolve, cache: { ttl: 60_000, max: 2 } })

    await renderer.getSeo(bot_request('/a'))
    await renderer.getSeo(bot_request('/b'))
    await renderer.getSeo(bot_request('/c'))
    await renderer.getSeo(bot_request('/a'))

    expect(resolve).toHaveBeenCalledTimes(4)
  })

  it('does not cache the failures', async () => {
    const resolve = vi.fn()
      .mockRejectedValueOnce(new Error('API down'))
      .mockResolvedValueOnce({ title: 'OK' })
    const renderer = createSeoRenderer({ resolve, cache: { ttl: 60_000 } })

    await renderer.getSeo(bot_request())
    expect((await renderer.getSeo(bot_request())).title).toBe('OK')
  })

  it('only resolves for crawlers with botsOnly', async () => {
    const resolve = vi.fn(() => ({ title: 'Product' }))
    const renderer = createSeoRenderer({ resolve, botsOnly: true, defaults: { title: 'My Site' } })

    expect((await renderer.getSeo(browser_request())).title).toBe('My Site')
    expect((await renderer.getSeo(bot_request())).title).toBe('Product')
    expect(resolve).toHaveBeenCalledOnce()
  })

  it('renders the HTML with the status of the resolved data', async () => {
    const renderer = createSeoRenderer({
      resolve: () => ({ title: 'Product not found', robots: 'noindex', status: 404 }),
    })

    const { html, status } = await renderer.render(bot_request(), '<html><head><title>A</title></head></html>')

    expect(status).toBe(404)
    expect(html).toContain('<title>Product not found</title>')
    expect(html).toContain('<meta name="robots" content="noindex">')
  })
})
