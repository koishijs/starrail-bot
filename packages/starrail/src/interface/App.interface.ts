import { Abyss } from "./Abyss.interface";
import { Character } from "./Character.interface";
import { DailyNote } from "./DailyNote.interface";
import { UserInfo } from "./UserInfo.interface";

export type AppCache = {
    [K in number]: {
        abyss?: { 1?: Abyss; 2?: Abyss }
        avatars?: Character[]
        info?: UserInfo
        roles?: Character[]
        dailyNote?: DailyNote
    }
}

export type AppServerLocale =
    | 'zh-cn'
    | 'zh-tw'
    | 'de-de'
    | 'en-us'
    | 'es-es'
    | 'fr-fr'
    | 'id-id'
    | 'ja-jp'
    | 'ko-kr'
    | 'pt-pt'
    | 'ru-ru'
    | 'th-th'
    | 'vi-vn'

export type AppRegion = 'os' | 'cn'