import { Context, DatabaseService, Field, FieldCollector, Observed as OB } from "koishi";

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

class StarRailDatabase {
    constructor(app: Context) {
        app.model.extend('binding', {
            sr: 'list'
        })
        app.model.extend('user', {
            sr_uid: 'string(9)'
        })
        app.model.extend('star_rail', {
            id: 'unsigned',
            uid: 'string(9)',
            doken: 'string',
            cookie: 'text'
        })

        app.on('ready', () => {

        })
    }

    getStarFields(fields: Field<StarRail.Field>): StarRail.Observed {
        return
    }
}

export default StarRailDatabase
