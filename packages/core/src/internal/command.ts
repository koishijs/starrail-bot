import { Command, Context, Schema } from "koishi";
import { IsDot } from "../utils/IsDot";

type CommandType = 'subset' | 'derive'

class StarRailCommander {
  static using = ['starrail']
  constructor(private ctx: Context, private config: StarRailCommander.Config) {
    //#region commands
    ctx.command('sr.uid [uid:string]')
      .option('default', '-d')
      .option('device', '-D')
      .option('remove', '-r')
      .option('user', '-u')
      .userFields(['sr_uid', 'id'])
      .action(async ({ session, options }, uid) => {
        const frist = !session.user.sr_uid
        const uids = await ctx.starrail.getUid(session.user.id)
        const findAll = (await ctx.database.get('star_rail', { uid }, ['bid'])).map(u => u.bid)

        if (findAll.length > 0 && !findAll.includes(session.user.id) && Object.keys(options).length <= 0) return session.text('.fail-binded')
        if (options.default && !uid) return

        if (!uid)
          if (Object.keys(options).length > 0) uid = session.user.sr_uid
          else
            if (uids.length <= 0) {
              return session.text('.list-none')
            } else
              return `<message>
              <p>${session.text('.list')}</p>
              ${uids
                  .sort(uid => uid === session.user.sr_uid ? -1 : 1)
                  .map((uid, i) => `<p>    ${i + 1}. ${uid + (i === 0
                    ? session.text('.list-def')
                    : '')}</p>`)
                  .join('')
                }
              </message>`

        // Option filter
        if (options.default) {
          if (uid === session.user.sr_uid) return session.text('.fail-isdef', [uid])
          session.user.sr_uid = uid
          return session.text('.bind-def', [uid])
        } else if (options.remove && options.user) {
          // TODO
          return
        } else if (options.remove) {
          if (!uids.includes(uid)) return session.text('.fail-remove')
          if (session.user.sr_uid === uid) {
            await session.send(session.text('.warn-rmdef', [uid]))
            const dot = await session.prompt(1500)
            if (dot && !IsDot(dot)) return session.text('.fail-dot')
            return session.text('.timeout')
          }
          await ctx.database.remove('star_rail', { uid })
          return session.text('.bind-removed')
        } else if (options.user) {
          // TODO
          return
        } else if (options.device) {
          // TODO
          return
        }
        console.log(frist, uid)
        await ctx.starrail.setUid(session.user.id, uid, frist)
        return `<i18n path=".bind-saved">${[uid]}</i18n>${frist ? session.text('.bind-frist') : ''}`
      })
    // private only
    ctx.private().command('sr.cookie [cookie]')
      .option('uid', '-u')
      .option('remove', '-r')
      .action(async () => {

      })
    //#endregion
  }

  private defineCommand(command: string, type: CommandType, ...args: any[]): Command {
    const def = type === 'subset' ? `sr.${command}` : `sr/${command}`
    const desc = typeof args[0] === 'string' ? args.shift() as string : ''
    const config = args[0] as Command.Config || {}
    return this.ctx.command(def, desc, config)
  }

  /**
   * @deprecated does not work with `hmr`, you can use `ctx.command('sr.[your command]')`
   */
  subcommand<D extends string>(def: D, config?: Command.Config): Command
  subcommand<D extends string>(def: D, desc: string, config?: Command.Config): Command
  public subcommand(def: string, ...args: any[]) {
    return this.defineCommand(def, 'subset', ...args)
  }

  /**
   * @deprecated does not work with `hmr`, you can use `ctx.command('sr [your command]')`
   */
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
