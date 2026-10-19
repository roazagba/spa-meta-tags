import type { SeoData, SeoTag } from './types'
import { escapeHtml, htmlToText, truncate } from './text'

export interface BuildTagsOptions {
  /** Maximum length of the description. Defaults to 200, 0 to disable */
  descriptionMaxLength?: number
}

/**
 * Builds the title, meta, Open Graph, Twitter and link tags from the SEO data
 */
export function buildSeoTags (data: SeoData, options: BuildTagsOptions = {}): SeoTag[] {
  const { descriptionMaxLength = 200 } = options
  const tags: SeoTag[] = []

  const meta = (key: 'name' | 'property', value: string, content?: string | number | null) => {
    if (content === undefined || content === null || content === '') return
    tags.push({ tag: 'meta', attrs: { [key]: value, content: String(content) } })
  }

  const description = data.description
    ? truncate(htmlToText(data.description), descriptionMaxLength)
    : undefined

  if (data.title) {
    tags.push({ tag: 'title', content: data.title })
  }

  meta('name', 'description', description)
  meta('name', 'robots', data.robots)

  // Open Graph
  meta('property', 'og:type', data.type ?? 'website')
  meta('property', 'og:site_name', data.siteName)
  meta('property', 'og:locale', data.locale)
  meta('property', 'og:title', data.title)
  meta('property', 'og:description', description)
  meta('property', 'og:url', data.url)
  meta('property', 'og:image', data.image)
  if (data.image) {
    meta('property', 'og:image:alt', data.imageAlt ?? data.title)
    meta('property', 'og:image:width', data.imageWidth)
    meta('property', 'og:image:height', data.imageHeight)
  }

  // Twitter / X
  meta('name', 'twitter:card', data.twitterCard ?? (data.image ? 'summary_large_image' : 'summary'))
  meta('name', 'twitter:site', data.twitterSite)
  meta('name', 'twitter:title', data.title)
  meta('name', 'twitter:description', description)
  meta('name', 'twitter:image', data.image)

  for (const extra of data.meta ?? []) {
    if ('property' in extra) {
      meta('property', extra.property, extra.content)
    } else {
      meta('name', extra.name, extra.content)
    }
  }

  // Links
  const canonical = data.canonical === false ? undefined : (data.canonical ?? data.url)
  if (canonical) {
    tags.push({ tag: 'link', attrs: { rel: 'canonical', href: canonical } })
  }
  if (data.favicon) {
    tags.push({ tag: 'link', attrs: { rel: 'icon', href: data.favicon } })
  }
  for (const link of data.links ?? []) {
    tags.push({ tag: 'link', attrs: { ...link } })
  }

  // Structured data
  const json_ld = data.jsonLd ? (Array.isArray(data.jsonLd) ? data.jsonLd : [data.jsonLd]) : []
  for (const item of json_ld) {
    tags.push({
      tag: 'script',
      attrs: { 'type': 'application/ld+json', 'data-spa-meta-tags': '' },
      // Avoid closing the script tag from the JSON content
      content: JSON.stringify(item).replace(/</g, '\\u003c'),
    })
  }

  return tags
}

function renderAttributes (attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .map(([name, value]) => (value === '' ? ` ${name}` : ` ${name}="${escapeHtml(value)}"`))
    .join('')
}

/**
 * Renders the tags as HTML
 */
export function renderSeoTags (tags: SeoTag[]): string {
  return tags.map(tag => {
    switch (tag.tag) {
      case 'title': {
        return `<title>${escapeHtml(tag.content)}</title>`
      }
      case 'script': {
        return `<script${renderAttributes(tag.attrs)}>${tag.content}</script>`
      }
      default: {
        return `<${tag.tag}${renderAttributes(tag.attrs)}>`
      }
    }
  }).join('\n')
}
