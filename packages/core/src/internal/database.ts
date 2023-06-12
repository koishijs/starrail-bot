import { Model } from "koishi";
import { Context, Field, Observed as OB } from "koishi";

declare module 'koishi' {
  interface User {
    sr_uid: string
  }
  interface Binding {
    sr: number[]
  }
  interface Tables {
    star_rail: StarRail.Database
  }
}

export namespace StarRail {
  export type Field = keyof Database
  export const fields: Field[] = []
  export type Observed<K extends Field = Field> = OB<Pick<Database, K>, Promise<void>>
  export interface Database {
    id: number
    bid: number
    uid: string
    doken: string // DS Token => doken
    cookie: string
  }
}

class StarRailDatabase {
  constructor(private app: Context) {
    app.model.extend('binding', {
      sr: 'list'
    })
    app.model.extend('user', {
      sr_uid: 'string(9)'
    })
    app.model.extend('star_rail', {
      id: 'unsigned',
      bid: 'integer',
      uid: 'string(9)',
      doken: 'string',
      cookie: 'text'
    }, {
      unique: ['id', 'uid'],
      autoInc: true,
      foreign: {
        id: ['user', 'id']
      }
    })

    app.on('ready', () => {

    })
  }

  async getUid(bid: number): Promise<string[]> {
    return (await this.app.database.get('star_rail', { bid }, ["uid"])).map(u => u.uid)
  }

  async existUid(uid: string): Promise<boolean> {
    return (await this.app.database.get('star_rail', { uid })).length > 0
  }

  async setUid(bid: number, srUid: string, def: boolean = false): Promise<void> {
    if (def === true) await this.app.database.set('user', { id: bid }, { sr_uid: srUid })
    await this.app.database.upsert('star_rail', [{ bid, uid: srUid }], ['uid'])
  }

  extendDatabase(fields: Field.Extension<StarRail.Database>, config?: Partial<Model.Config<StarRail.Database>>) {
    this.app.model.extend('star_rail', fields, config)
  }
}

export default StarRailDatabase
