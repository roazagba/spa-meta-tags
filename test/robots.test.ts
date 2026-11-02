import { describe, expect, it } from 'vitest'
import { buildRobotsTxt } from '../src'

describe('buildRobotsTxt', () => {
  it('allows everything by default', () => {
    expect(buildRobotsTxt()).toBe('User-agent: *\nDisallow:\n')
  })

  it('writes the rules and the sitemaps', () => {
    const txt = buildRobotsTxt({
      disallow: ['/admin'],
      sitemaps: ['https://a.test/sitemap.xml', 'https://a.test/news.xml'],
    })

    expect(txt).toBe([
      'User-agent: *',
      'Disallow: /admin',
      '',
      'Sitemap: https://a.test/sitemap.xml',
      'Sitemap: https://a.test/news.xml',
      '',
    ].join('\n'))
  })

  it('blocks the AI crawlers of a kind', () => {
    const txt = buildRobotsTxt({ ai: { training: false } })

    expect(txt).toContain('User-agent: GPTBot\nUser-agent: ClaudeBot')
    expect(txt).toContain('Disallow: /\n')
    expect(txt).not.toContain('ChatGPT-User')
  })

  it('allows a kind explicitly', () => {
    const txt = buildRobotsTxt({ disallow: ['/private'], ai: { training: false, search: true, user: true } })

    expect(txt).toMatch(/User-agent: OAI-SearchBot[\s\S]*?Allow: \//)
    expect(txt).toMatch(/User-agent: ChatGPT-User[\s\S]*?Allow: \//)
    expect(txt).toMatch(/User-agent: GPTBot[\s\S]*?Disallow: \//)
  })
})
