import { Context, DatabaseService, Observed as OB } from "koishi";

declare module 'koishi' {
    interface User {
        sr_uid: string
    }
    interface Binding {
        sr: number[]
    }
    interface Tables {
        star_rail: StarRail
    }
}

export interface StarRail {
    id: number
    uid: string
    doken: string // DS Token => doken
    cookie: string
}

export namespace StarRail {
    export type Field = keyof StarRail
    export const fields: Field[] = []
    export type Observed<K extends Field = Field> = OB<Pick<StarRail, K>, Promise<void>>
}

class StarRailDatabase extends DatabaseService {
    constructor(app: Context) {
        super(app)
        this.extend('binding', {
            sr: 'list'
        })
        this.extend('user', {
            sr_uid: 'string(9)'
        })
        this.extend('star_rail', {
            id: 'unsigned',
            uid: 'string(9)',
            doken: 'string',
            cookie: 'text'
        })
    }
}

export default StarRailDatabase
