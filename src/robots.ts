import { aiBots, type AiBotKind } from './ai-bots'

export interface RobotsTxtOptions {
  /** Paths allowed for every crawler, for example `['/']` */
  allow?: string[]
  /** Paths blocked for every crawler, for example `['/admin']` */
  disallow?: string[]
  /** Absolute URLs of the sitemaps */
  sitemaps?: string | string[]
  /**
   * Policy by kind of AI crawler. `false` blocks the whole site, `true` allows it explicitly,
   * and a kind left out follows the rules of every crawler
   */
  ai?: Partial<Record<AiBotKind, boolean>>
}

/**
 * Builds the content of a `robots.txt`, with an optional policy for AI crawlers
 */
export function buildRobotsTxt (options: RobotsTxtOptions = {}): string {
  const { allow = [], disallow = [], ai = {} } = options
  const sitemaps = ([] as string[]).concat(options.sitemaps ?? [])

  const groups: string[] = []

  const rules = [
    ...allow.map(path => `Allow: ${path}`),
    ...disallow.map(path => `Disallow: ${path}`),
  ]
  // An empty Disallow allows everything
  groups.push(['User-agent: *', ...(rules.length ? rules : ['Disallow:'])].join('\n'))

  for (const kind of ['training', 'search', 'user'] as const) {
    const policy = ai[kind]
    if (policy === undefined) continue

    const agents = aiBots.filter(bot => bot.kind === kind).map(bot => `User-agent: ${bot.agent}`)
    groups.push([...agents, policy ? 'Allow: /' : 'Disallow: /'].join('\n'))
  }

  if (sitemaps.length) groups.push(sitemaps.map(url => `Sitemap: ${url}`).join('\n'))

  return `${groups.join('\n\n')}\n`
}
