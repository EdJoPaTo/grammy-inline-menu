import {InlineKeyboardMarkup, ForceReply} from 'telegram-typings'

export interface InlineExtra {
  caption?: string;
  parse_mode?: 'Markdown';
  reply_markup: InlineKeyboardMarkup;
}

export interface ForceReplyExtra {
  reply_markup: ForceReply;
}

export const DUMMY_MESSAGE = {message_id: 42, date: 0, chat: {id: 0, type: 'private'}}
