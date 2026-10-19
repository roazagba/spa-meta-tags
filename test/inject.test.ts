import { describe, expect, it } from 'vitest'
import { buildSeoTags, injectSeoTags } from '../src'

const template = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Site</title>
    <meta name="description" content="Default description">
    <meta property='og:title' content="Old title">
    <link rel="icon" href="/favicon.png" />
    <link rel="stylesheet" href="/app.css">
    <!--seo-head-->
  </head>
  <body>
    <div id="app"></div>
    <meta name="description" content="in the body">
  </body>
</html>`

describe('injectSeoTags', () => {
  const tags = buildSeoTags({
    title: 'My Store',
    description: 'New description',
    favicon: 'https://cdn.test/favicon.webp',
  })

  it('replaces the placeholder and removes the redefined tags', () => {
    const html = injectSeoTags(template, tags)

    expect(html).toContain('<title>My Store</title>')
    expect(html).not.toContain('<title>My Site</title>')
    expect(html).not.toContain('Default description')
    expect(html).not.toContain('Old title')
    expect(html).not.toContain('/favicon.png')
    expect(html).not.toContain('<!--seo-head-->')
    expect(html.match(/<title>/g)).toHaveLength(1)
  })

  it('keeps the other tags and the body', () => {
    const html = injectSeoTags(template, tags)

    expect(html).toContain('<meta charset="UTF-8" />')
    expect(html).toContain('name="viewport"')
    expect(html).toContain('<link rel="stylesheet" href="/app.css">')
    expect(html).toContain('<meta name="description" content="in the body">')
  })

  it('keeps the template tags which are not redefined', () => {
    const html = injectSeoTags(template, buildSeoTags({ title: 'My Store' }))

    expect(html).toContain('Default description')
    expect(html).toContain('/favicon.png')
  })

  it('inserts before </head> without placeholder', () => {
    const html = injectSeoTags('<html><head><title>A</title></head><body></body></html>', tags)

    expect(html).toMatch(/<head><title>My Store<\/title>[\s\S]*<\/head><body>/)
  })

  it('keeps the existing tags when replaceExisting is false', () => {
    const html = injectSeoTags(template, tags, { replaceExisting: false })

    expect(html).toContain('<title>My Site</title>')
    expect(html).toContain('<title>My Store</title>')
  })

  it('does not interpret "$" in the content', () => {
    const html = injectSeoTags(template, buildSeoTags({ title: 'Price $& $1 $$' }))

    expect(html).toContain('<title>Price $&amp; $1 $$</title>')
  })
})
