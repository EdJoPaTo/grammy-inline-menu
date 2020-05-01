import {InputFile, ParseMode} from 'telegraf/typings/telegram-types'

import {isObject} from './generic-types'

export type Body = string | TextBody | PhotoBody

export interface TextBody {
	readonly text: string;
	readonly parse_mode?: ParseMode;
}

export interface PhotoBody {
	readonly photo: InputFile;
	readonly text?: string;
	readonly parse_mode?: ParseMode;
}

export function isPhotoBody(body: Body): body is PhotoBody {
	return isObject(body) && 'photo' in body && Boolean(body.photo)
}

export function getBodyText(body: TextBody | string): string {
	return typeof body === 'string' ? body : body.text
}
