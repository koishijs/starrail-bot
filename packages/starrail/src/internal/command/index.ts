import { Context, Schema } from "koishi";
import { StarRailPlugin } from "../plugin";

declare module '../plugin' {
    namespace StarRailPlugin {
        interface Config {

        }
    }
}

StarRailPlugin.defineSchema({

}, '命令设置')

export default class StarRailCommander extends StarRailPlugin {
    static using = ['starrail']
    constructor(private ctx: Context, private cfg: StarRailPlugin.Config) {
        super()
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
