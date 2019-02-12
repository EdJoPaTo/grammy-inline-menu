import {InlineKeyboardMarkup, ForceReply} from 'telegram-typings'

export interface InlineExtra {
  reply_markup: InlineKeyboardMarkup;
  parse_mode?: 'Markdown';
}

export interface ForceReplyExtra {
  reply_markup: ForceReply;
}

export const DUMMY_MESSAGE = {message_id: 42, date: 0, chat: {id: 0, type: 'private'}}
