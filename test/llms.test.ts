import { describe, expect, it } from 'vitest'
import { buildLlmsTxt } from '../src'

describe('buildLlmsTxt', () => {
  it('builds a title only file', () => {
    expect(buildLlmsTxt({ title: 'My site' })).toBe('# My site\n')
  })

  it('builds the summary, the details and the sections', () => {
    const txt = buildLlmsTxt({
      title: 'My site',
      description: 'A shop\nfor everyone',
      details: 'Prices are in CFA francs.\n',
      sections: [
        { title: 'Docs', links: [{ title: 'Guide', url: 'https://a.test/guide.md', description: 'How to start' }, { title: 'API', url: 'https://a.test/api.md' }] },
      ],
    })

    expect(txt).toBe([
      '# My site',
      '',
      '> A shop for everyone',
      '',
      'Prices are in CFA francs.',
      '',
      '## Docs',
      '- [Guide](https://a.test/guide.md): How to start',
      '- [API](https://a.test/api.md)',
      '',
    ].join('\n'))
  })

  it('puts the optional section last', () => {
    const txt = buildLlmsTxt({
      title: 'My site',
      sections: [
        { title: 'More', optional: true, links: [{ title: 'Blog', url: 'https://a.test/blog' }] },
        { title: 'Docs', links: [{ title: 'Guide', url: 'https://a.test/guide' }] },
      ],
    })

    expect(txt.indexOf('## Docs')).toBeLessThan(txt.indexOf('## Optional'))
  })
})
