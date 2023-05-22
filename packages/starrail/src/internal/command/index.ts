import { Context, Schema } from "koishi";

class StarRailCommander {
    static using = ['genshin']
    constructor(private ctx: Context, private cfg: StarRailCommander.Config) {
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
        //#endregion
    }
}

namespace StarRailCommander {
    export interface Config { }
    export const Config: Schema<Config> = Schema.object({})
}

export default StarRailCommander
