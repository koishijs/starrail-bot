import { Command, Context, Dict, Schema, Service, Session, User } from 'koishi'
import StarRailDatabase from './internal/database'
import StarRailCommand from './internal/command'
import { StarRail } from './internal/database'

declare module 'koishi' {
  interface Context {
    starrail: HonkaiStarRail
  }
}

type CommandType = 'subset' | 'derive'

class HonkaiStarRail extends Service {
  constructor(private app: Context, private config: HonkaiStarRail.Config) {
    super(app, 'starrail', true)
    app.on('ready', this.ready(app))
  }

  protected ready(ctx: Context) {
    ctx.command('sr').action(async ({ session }) => session.execute('help sr'))
    return async () => {
      // apply internal plugins.
      ctx.plugin(StarRailDatabase)
      // ctx.plugin(StarRailCommand, this.config)
    }
  }

  private defineCommand(command: string, type: CommandType, ...args: any[]): Command {
    const def = type === 'subset' ? `sr.${command}` : `sr/${command}`
    const desc = typeof args[0] === 'string' ? args.shift() as string : ''
    const config = args[0] as Command.Config || {}
    return this.app.command(def, desc, config)
  }

  subcommand<D extends string>(def: D, config?: Command.Config): Command
  subcommand<D extends string>(def: D, desc: string, config?: Command.Config): Command
  public subcommand(def: string, ...args: any[]) {
    return this.defineCommand(def, 'subset', ...args)
  }

  dercommand<D extends string>(def: D, config?: Command.Config): Command
  dercommand<D extends string>(def: D, desc: string, config?: Command.Config): Command
  public dercommand(def: string, ...args: any[]) {
    return this.defineCommand(def, 'derive', ...args)
  }

  /**
   * WIP
   */
  async getUid(id: number): Promise<Pick<StarRail, "uid">[]> {
    return await this.ctx.database.get('star_rail', id)
  }
  async setUid(id: number, sr_uid: string, default_: boolean = false): Promise<void> {
    if (default_ === true) await this.ctx.database.set('user', id, { sr_uid: sr_uid })
    await this.ctx.database.set('star_rail', id, { uid: sr_uid })
  }
}

namespace HonkaiStarRail {
  export interface Config {

  }
  export const Config: Schema<Config> = Schema.intersect([
    Schema.object({

    })
  ])
}

export * from './internal/database'

export default HonkaiStarRail
