import { Command, Context, Dict, Schema, Service } from 'koishi'
import { StarRailPlugin } from './internal/plugin'
import SRDB from './internal/database'
import SRCmd from './internal/command'

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
    // Pre-processing without entering the event hook callback
    ctx.command('sr').action(async ({ session }) => session.execute('help sr'))
    return async () => {
      // apply internal plugins.
      ctx.plugin(SRDB)
      ctx.plugin(SRCmd, this.config)
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
  getUid() { }
  setUid() { }
}

namespace HonkaiStarRail {
  export type Config = StarRailPlugin.Config
  export const Config: Schema<Config> = StarRailPlugin.Config
}

export * from './internal/database'

export default HonkaiStarRail
