import type { SeoTag } from './types'
import { renderSeoTags } from './tags'

export interface InjectOptions {
  /** Comment replaced by the tags. Defaults to `<!--seo-head-->`; otherwise the tags are inserted before `</head>` */
  placeholder?: string
  /** Removes the tags of the template that are redefined (title, description, og:*...). Defaults to true */
  replaceExisting?: boolean
}

const attribute_regex = /([^\s"'=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g

function parseAttributes (tag_html: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  // Skip the tag name
  const inner = tag_html.replace(/^<\s*[a-z]+/i, '').replace(/\/?>$/, '')

  for (const match of inner.matchAll(attribute_regex)) {
    const name = match[1]?.toLowerCase()
    if (name) {
      attrs[name] = match[2] ?? match[3] ?? match[4] ?? ''
    }
  }

  return attrs
}

/** Identifies a tag: two tags with the same key cannot be both in the page */
function tagKey (tag: SeoTag): string | null {
  switch (tag.tag) {
    case 'title': {
      return 'title'
    }
    case 'meta': {
      if (tag.attrs.name) return `meta:name:${tag.attrs.name.toLowerCase()}`
      if (tag.attrs.property) return `meta:property:${tag.attrs.property.toLowerCase()}`
      return null
    }
    case 'link': {
      const rel = tag.attrs.rel?.toLowerCase()
      // Several links can have the same rel (alternate, preload...): only these ones are unique
      return rel && ['canonical', 'icon', 'shortcut icon'].includes(rel) ? `link:${rel}` : null
    }
    default: {
      return null
    }
  }
}

function removeExistingTags (head: string, tags: SeoTag[]): string {
  const keys = new Set(tags.map(tag => tagKey(tag)).filter(Boolean))

  if (keys.has('title')) {
    head = head.replace(/<title\b[^>]*>[\s\S]*?<\/title>[^\S\n]*\n?/gi, '')
  }

  head = head.replace(/<(meta|link)\b[^>]*>[^\S\n]*\n?/gi, (tag_html, tag_name: string) => {
    const attrs = parseAttributes(tag_html)
    const key = tagKey({ tag: tag_name.toLowerCase() as 'meta' | 'link', attrs })
    return key && keys.has(key) ? '' : tag_html
  })

  // Structured data previously injected by this package
  if (tags.some(tag => tag.tag == 'script')) {
    head = head.replace(/<script\b[^>]*\bdata-spa-meta-tags\b[^>]*>[\s\S]*?<\/script>[^\S\n]*\n?/gi, '')
  }

  return head
}

/**
 * Injects the tags in the `<head>` of the HTML page
 */
export function injectSeoTags (html: string, tags: SeoTag[], options: InjectOptions = {}): string {
  const { placeholder = '<!--seo-head-->', replaceExisting = true } = options

  const head_end = html.search(/<\/head>/i)
  let head = head_end == -1 ? html : html.slice(0, head_end)
  const rest = head_end == -1 ? '' : html.slice(head_end)

  if (replaceExisting) {
    head = removeExistingTags(head, tags)
  }

  const rendered = renderSeoTags(tags)

  if (placeholder && head.includes(placeholder)) {
    // Function replacer: "$" in the content must not be read as a replacement pattern
    return head.replace(placeholder, () => rendered) + rest
  }

  if (head_end != -1) {
    return `${head}${rendered}\n${rest}`
  }

  return `${rendered}\n${head}`
}
