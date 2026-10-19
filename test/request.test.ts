import { describe, expect, it } from 'vitest'
import { createSeoContext, getRequestOrigin, htmlToText, isBot, truncate } from '../src'

describe('getRequestOrigin', () => {
  it('uses the headers of the reverse proxy', () => {
    const origin = getRequestOrigin({
      headers: { 'host': 'localhost:3002', 'x-forwarded-proto': 'https, http', 'x-forwarded-host': 'shop.example.com' },
    })

    expect(origin).toBe('https://shop.example.com')
  })

  it('ignores the proxy headers when trustProxy is false', () => {
    const origin = getRequestOrigin(
      { headers: { 'host': 'shop.localhost:3002', 'x-forwarded-proto': 'https' } },
      { trustProxy: false },
    )

    expect(origin).toBe('http://shop.localhost:3002')
  })

  it('detects https on the socket', () => {
    expect(getRequestOrigin({ headers: { host: 'a.test' }, socket: { encrypted: true } })).toBe('https://a.test')
  })
})

describe('createSeoContext', () => {
  it('parses the URL of the request', () => {
    const context = createSeoContext({
      url: '/product?ref=whatsapp',
      headers: { 'host': 'shop.example.com', 'user-agent': 'WhatsApp/2.23.20.0' },
    })

    expect(context.path).toBe('/product')
    expect(context.query.get('ref')).toBe('whatsapp')
    expect(context.host).toBe('shop.example.com')
    expect(context.isBot).toBe(true)
  })

  it('prefers originalUrl (Express)', () => {
    const context = createSeoContext({ url: '/x', originalUrl: '/store/x', headers: { host: 'a.test' } })

    expect(context.path).toBe('/store/x')
  })
})

describe('isBot', () => {
  it.each([
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'WhatsApp/2.23.20.0 A',
    'Twitterbot/1.0',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'LinkedInBot/1.0',
    'TelegramBot (like TwitterBot)',
  ])('detects %s', user_agent => {
    expect(isBot(user_agent)).toBe(true)
  })

  it('does not detect a browser', () => {
    expect(isBot('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36')).toBe(false)
    expect(isBot(undefined)).toBe(false)
  })
})

describe('text', () => {
  it('converts HTML to text', () => {
    expect(htmlToText('<p>Hello&nbsp;<b>the</b>&#32;caf&eacute; &#x263A;</p><script>x()</script>'))
      .toBe('Hello the café ☺')
  })

  it('truncates with an ellipsis', () => {
    expect(truncate('abcdef', 4)).toBe('abc…')
    expect(truncate('abc', 4)).toBe('abc')
  })
})
