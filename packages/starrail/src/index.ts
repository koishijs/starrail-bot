import { Context, Schema } from 'koishi'

import Atlas from '../../atlas';
import GachaLog from '../../gachaLog';
import * as Code from '../../code'



export const name = 'starrail'

class StarRail {
  constructor(ctx: Context, config: StarRail.Config) {
    if (config.Atlas.enabled)
      ctx.plugin(Atlas, config.Atlas)
    if (config.Code.enabled)
      ctx.plugin(Code, config.Code)
    if (config.GachaLog.enabled)
      ctx.plugin(GachaLog, config.GachaLog)
  }
}

namespace StarRail {
   export interface PluginEnableConfig {
        enabled: boolean
      }
   export interface Config {
        superAdminQQ?: string[]
        Atlas?: Atlas.Config & PluginEnableConfig
        Code?: Code.Config & PluginEnableConfig
        GachaLog?: GachaLog.Config & PluginEnableConfig
      }
    export const pluginLoad = <T>(schema: Schema<T>): Schema<T & PluginEnableConfig> =>
      Schema.intersect([
        Schema.object({
          enabled: Schema.boolean().default(false).description('是否启用插件'),
        }),
        Schema.union([
          Schema.object({
            enabled: Schema.const(true).required(),
            ...schema.dict,
          }),
          Schema.object({
            enabled: Schema.const(false),
          }),
        ]) as Schema<T>,
      ])
    

  export const Config:Schema = Schema.object({
    superAdminQQ: Schema.array(String).description('超级管理员QQ号 (必填)'),
    Atlas: pluginLoad(Atlas.Config).description('图鉴'),
    Code: pluginLoad(Code.Config).description('前瞻直播兑换码'),
    GachaLog: pluginLoad(GachaLog.Config).description('抽卡分析'),
  })
}

export default StarRail