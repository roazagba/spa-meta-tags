const named_entities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: '\'',
  nbsp: ' ',
  // Common in French rich text
  eacute: 'é',
  egrave: 'è',
  ecirc: 'ê',
  euml: 'ë',
  agrave: 'à',
  acirc: 'â',
  ccedil: 'ç',
  icirc: 'î',
  iuml: 'ï',
  ocirc: 'ô',
  ugrave: 'ù',
  ucirc: 'û',
  oelig: 'œ',
  laquo: '«',
  raquo: '»',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  euro: '€',
  copy: '©',
  reg: '®',
  trade: '™',
}

/**
 * Escapes a string to be used in an HTML attribute or text
 */
export function escapeHtml (value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Decodes the HTML entities (named and numeric)
 */
export function decodeEntities (value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] == '#') {
      const code = entity[1]?.toLowerCase() == 'x'
        ? Number.parseInt(entity.slice(2), 16)
        : Number.parseInt(entity.slice(1), 10)

      return Number.isNaN(code) ? match : String.fromCodePoint(code)
    }

    return named_entities[entity.toLowerCase()] ?? match
  })
}

/**
 * Converts HTML to plain text (works on the server, where DOMParser is not available)
 */
export function htmlToText (html?: string | null): string {
  if (!html) return ''

  const text = html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')

  return decodeEntities(text).replace(/\s+/g, ' ').trim()
}

/**
 * Truncates a text to max_length characters, adding an ellipsis
 */
export function truncate (text: string, max_length: number): string {
  if (max_length <= 0 || text.length <= max_length) return text

  return `${text.slice(0, max_length - 1).trimEnd()}…`
}
