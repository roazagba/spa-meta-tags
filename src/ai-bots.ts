export type AiBotKind = 'training' | 'search' | 'user'

export interface AiBot {
  /** User agent token, as written in `robots.txt` */
  agent: string
  company: string
  /**
   * - `training`: collects content to train models
   * - `search`: indexes content for AI search and answers
   * - `user`: fetches a page when a person asks the assistant for it
   */
  kind: AiBotKind
}

/**
 * Known AI crawlers. `Google-Extended` and `Applebot-Extended` are `robots.txt` tokens only: they never appear in a user agent
 */
export const aiBots: readonly AiBot[] = [
  // OpenAI
  { agent: 'GPTBot', company: 'OpenAI', kind: 'training' },
  { agent: 'OAI-SearchBot', company: 'OpenAI', kind: 'search' },
  { agent: 'ChatGPT-User', company: 'OpenAI', kind: 'user' },
  // Anthropic
  { agent: 'ClaudeBot', company: 'Anthropic', kind: 'training' },
  { agent: 'anthropic-ai', company: 'Anthropic', kind: 'training' },
  { agent: 'Claude-SearchBot', company: 'Anthropic', kind: 'search' },
  { agent: 'Claude-User', company: 'Anthropic', kind: 'user' },
  // Google and Apple (tokens that opt out of AI training)
  { agent: 'Google-Extended', company: 'Google', kind: 'training' },
  { agent: 'Applebot-Extended', company: 'Apple', kind: 'training' },
  // Perplexity
  { agent: 'PerplexityBot', company: 'Perplexity', kind: 'search' },
  { agent: 'Perplexity-User', company: 'Perplexity', kind: 'user' },
  // Others
  { agent: 'Meta-ExternalAgent', company: 'Meta', kind: 'training' },
  { agent: 'Bytespider', company: 'ByteDance', kind: 'training' },
  { agent: 'CCBot', company: 'Common Crawl', kind: 'training' },
  { agent: 'cohere-ai', company: 'Cohere', kind: 'training' },
  { agent: 'DuckAssistBot', company: 'DuckDuckGo', kind: 'user' },
  { agent: 'MistralAI-User', company: 'Mistral', kind: 'user' },
]

const escape_regex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const ai_bot_pattern = aiBots.map(bot => escape_regex(bot.agent)).join('|')

const ai_bot_regex = new RegExp(ai_bot_pattern, 'i')

/**
 * True when the user agent is an AI crawler (GPTBot, ClaudeBot, PerplexityBot, ChatGPT-User, etc.)
 */
export function isAiBot (user_agent?: string | null): boolean {
  return !!user_agent && ai_bot_regex.test(user_agent)
}
