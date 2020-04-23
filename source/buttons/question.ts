import {Context as TelegrafContext} from 'telegraf'
import {MessageEntity} from 'telegram-typings'

const BASE_URL = 'http://t.me/#'

export function isReplyToQuestion(ctx: TelegrafContext, identifier: string): boolean {
  if (!ctx.message || !ctx.message.reply_to_message) {
    return false
  }

  const repliedTo = ctx.message.reply_to_message
  if (!repliedTo.entities) {
    return false
  }

  const relevantEntity = repliedTo.entities
    .filter(o => o.type === 'text_link')
    .slice(-1)[0] as MessageEntity | undefined

  if (!relevantEntity || !relevantEntity.url || !relevantEntity.url.startsWith(BASE_URL)) {
    return false
  }

  const repliedToIdentifier = relevantEntity.url.slice(BASE_URL.length)
  return repliedToIdentifier === identifier
}

export function signQuestionText(questionText: string, identifier: string): string {
  const suffix = `[\u200C](${BASE_URL}${identifier})`
  return questionText + suffix
}
