import { Command, Context, Schema, Session } from "koishi";

type CommandType = 'subset' | 'derive'

class StarRailCommander {
  constructor(private ctx: Context, private config: StarRailCommander.Config) {
    //#region commands
    ctx.starrail.subcommand('uid <uid>')
      .option('default', '-d')
      .option('remove', '-r')
      .userFields(['sr_uid'])
      .action(async ({ session, options }, uid) => {
        if (options.default) {
          session.user.sr_uid = uid
          return session.text('.def', [uid])
        } else if (options.remove) {
          if (session.user.sr_uid === uid) {
            await session.send(session.text('.remove-def', [uid]))
            const dot = await session.prompt(1500)
            if (/\.|。/.test(dot)) {
              return session.text('.removed-def')
            }
            return session.text('.timeout')
          }
          return session.text('.removed', [uid])
        }
        if (session.user.sr_uid) {
          //
        } else {
          session.user.sr_uid = uid
          //
          return session.text('.binded') + session.text('.frist', [uid])
        }

      })
    ctx.starrail.subcommand('cookie [uid]')
      .option('bind', '-b')
      .option('remove', '-r')
      .action(async () => {

      })
    ctx.starrail.subcommand('bind <uid:string>')
      .alias('星铁绑定')
      .action(async ({ session }, uid) => {
        if (!uid) {
          session.send('请输入uid')
          uid = await session.prompt()
        }
        if (!uid) return
        const session_user: Session<"id"> = session as Session<"id">
        const uid_base = (await this.ctx.starrail.getUid(session_user.user.id))[0]?.uid
        let user_enable = false
        if (uid_base) user_enable = true
        await this.ctx.starrail.setUid(session_user.user.id, uid, user_enable)
        return '绑定成功'
      })
    //#endregion
  }

  private defineCommand(command: string, type: CommandType, ...args: any[]): Command {
    const def = type === 'subset' ? `sr.${command}` : `sr/${command}`
    const desc = typeof args[0] === 'string' ? args.shift() as string : ''
    const config = args[0] as Command.Config || {}
    return this.ctx.command(def, desc, config)
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
}

namespace StarRailCommander {
  export interface Config { }
  export const Config: Schema<Config> = Schema.object({}).description('命令设置')
}

export default StarRailCommander
