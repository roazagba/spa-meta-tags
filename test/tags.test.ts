import { describe, expect, it } from 'vitest'
import { buildSeoTags, renderSeoTags } from '../src'

describe('buildSeoTags', () => {
  it('builds the title, Open Graph and Twitter tags', () => {
    const html = renderSeoTags(buildSeoTags({
      title: 'Barça 2026 Jersey | My Store',
      description: '<p>The <strong>authentic</strong> &amp; lightweight jersey</p>',
      image: 'https://cdn.test/jersey.webp',
      url: 'https://shop.example.com/jersey',
      type: 'product',
      siteName: 'My Store',
      locale: 'fr_FR',
    }))

    expect(html).toContain('<title>Barça 2026 Jersey | My Store</title>')
    expect(html).toContain('<meta name="description" content="The authentic &amp; lightweight jersey">')
    expect(html).toContain('<meta property="og:type" content="product">')
    expect(html).toContain('<meta property="og:image" content="https://cdn.test/jersey.webp">')
    expect(html).toContain('<meta property="og:image:alt" content="Barça 2026 Jersey | My Store">')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">')
    expect(html).toContain('<link rel="canonical" href="https://shop.example.com/jersey">')
  })

  it('does not render missing values', () => {
    const html = renderSeoTags(buildSeoTags({ title: 'Store' }))

    expect(html).not.toContain('og:image')
    expect(html).not.toContain('description')
    expect(html).not.toContain('canonical')
    expect(html).toContain('<meta name="twitter:card" content="summary">')
    expect(html).toContain('<meta property="og:type" content="website">')
  })

  it('escapes the values', () => {
    const html = renderSeoTags(buildSeoTags({ title: '"><script>alert(1)</script>' }))

    expect(html).not.toContain('<script>')
    expect(html).toContain('<title>&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;</title>')
  })

  it('truncates the description', () => {
    const tags = buildSeoTags({ description: 'a'.repeat(300) }, { descriptionMaxLength: 50 })
    const description = tags.find(tag => tag.tag == 'meta' && tag.attrs.name == 'description')

    expect(description?.tag == 'meta' && description.attrs.content).toHaveLength(50)
  })

  it('renders the canonical only when not disabled', () => {
    const html = renderSeoTags(buildSeoTags({ url: 'https://a.test/x', canonical: false }))

    expect(html).toContain('og:url')
    expect(html).not.toContain('canonical')
  })

  it('renders the additional tags and the structured data', () => {
    const html = renderSeoTags(buildSeoTags({
      meta: [{ property: 'product:price:amount', content: '15000' }, { name: 'theme-color', content: '#000' }],
      links: [{ rel: 'alternate', href: 'https://a.test/en', hreflang: 'en' }],
      jsonLd: { '@type': 'Product', 'name': '</script><b>' },
    }))

    expect(html).toContain('<meta property="product:price:amount" content="15000">')
    expect(html).toContain('<meta name="theme-color" content="#000">')
    expect(html).toContain('<link rel="alternate" href="https://a.test/en" hreflang="en">')
    expect(html).toContain('<script type="application/ld+json" data-spa-meta-tags>')
    expect(html).not.toContain('</script><b>')
  })
})
