export interface LlmsLink {
  title: string
  /** Absolute URL, ideally to a page in Markdown */
  url: string
  description?: string
}

export interface LlmsSection {
  title: string
  links: LlmsLink[]
  /** Secondary section: AI tools can skip it when the context is short */
  optional?: boolean
}

export interface LlmsTxtOptions {
  /** Name of the site or project */
  title: string
  /** Short summary, rendered as a quote */
  description?: string
  /** Free Markdown text between the summary and the sections */
  details?: string
  sections?: LlmsSection[]
}

const one_line = (value: string): string => value.replace(/\s+/g, ' ').trim()

/**
 * Builds the content of a `/llms.txt` file (https://llmstxt.org): a Markdown summary of the site for AI tools
 */
export function buildLlmsTxt (options: LlmsTxtOptions): string {
  const { title, description, details, sections = [] } = options

  const blocks: string[] = [`# ${one_line(title)}`]

  if (description) blocks.push(`> ${one_line(description)}`)
  if (details) blocks.push(details.trim())

  // Optional sections go last, as the format expects
  const ordered = [...sections.filter(section => !section.optional), ...sections.filter(section => section.optional)]

  for (const section of ordered) {
    const lines = section.links.map(({ title: link_title, url, description: link_description }) => {
      const link = `- [${one_line(link_title)}](${url})`
      return link_description ? `${link}: ${one_line(link_description)}` : link
    })
    blocks.push([`## ${section.optional ? 'Optional' : one_line(section.title)}`, ...lines].join('\n'))
  }

  return `${blocks.join('\n\n')}\n`
}
