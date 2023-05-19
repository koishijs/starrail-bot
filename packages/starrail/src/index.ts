import { Context, Schema } from 'koishi'

export const name = 'starrail'

class StarRail {
  constructor(ctx: Context, config: StarRail.Config) {

  }
}

namespace StarRail {
  export interface Config { }

  export const Config: Schema<Config> = Schema.object({})
}

export default StarRail