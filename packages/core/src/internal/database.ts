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
  constructor(private app: Context) {
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
    }, {
      primary: 'uid',
      unique: ['id', 'uid'],
      foreign: {
        id: ['user', 'id']
      }
    })

    app.on('ready', () => {

    })
  }
  /**
  * WIP
  */
  async getUid(id: number): Promise<Pick<StarRail, "uid">[]> {
    return await this.app.database.get('star_rail', id, ["uid"])
  }
  async setUid(id: number, srUid: string, def: boolean = false): Promise<void> {
    if (def === true) await this.app.database.set('user', id, { sr_uid: srUid })
    await this.app.database.set('star_rail', id, { uid: srUid })
  }
  getStarFields(fields: Field<StarRail.Field>): StarRail.Observed {
    return
  }

  extendDatabase(fields: Field.Extension<StarRail>, config: Partial<Model.Config<StarRail>>) {
    this.app.model.extend('star_rail', fields, config)
  }
}

export default StarRailDatabase
