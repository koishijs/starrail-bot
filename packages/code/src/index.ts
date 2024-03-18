import { Context, Logger, Quester, Schema, Session, Time } from 'koishi'
import { CodeList, MiyouLiveCode, MiyouLiveIndex } from './interface/MiyouLive.interface'

export const name = 'starrail-code'

export const using = ['starrail']

export const usage = `
## 使用说明

发送 \`sr.code\` 即可获得前瞻直播兑换码。

兑换码接口返回与前瞻直播有 2 分钟左右延迟，应为正常现象，请耐心等待。
`

type HoyoLabRespose<T> = {
  retcode: number
  message: string
  data: T
}

export interface Config {
  // nikename: boolean
}

export const Config: Schema<Config> = Schema.object({
  // nikename: Schema.boolean().default(false).description('自动将下版本预告同步到群名片（仅 onebot 平台可用）')
})

const logger = new Logger('sr-code')

export function apply(ctx: Context) {
  ctx.command('sr.code 获取前瞻直播兑换码')
    .action(async ({ session }) => {
      const quester = quest(ctx.http)
      session.send('正在查找最近的前瞻直播')
      const foresightList = (await quester<HoyoLab>('https://bbs-api.mihoyo.com/painter/api/user_instant/list', {
        offset: 0,
        size: 20,
        uid: '80823548'
      })).list
        .filter(data => /([0-9].[0-9])版本前瞻/gm.test(data?.post?.post.subject))
        .filter(data => data?.post?.post.created_at * 1000 > (Date.now() - 2 * 24 * 60 * 60 * 1000))
      if (foresightList.length === 0)
        return '近期没有前瞻直播哦'
      const actId = foresightList[0]?.post?.post?.structured_content.match(/{\"link\":\"https:\/\/webstatic.mihoyo.com\/bbs\/event\/live\/index.html\?act_id=(.*?)\\/m)[1]
      const imageUrl = foresightList[0]?.post?.post?.cover
      if (!actId) {
        logger.warn('Failed to get act_id, ingnore')
        return '未找到活动 ID'
      }
      const { live } = (await quester<MiyouLiveIndex>('https://api-takumi.mihoyo.com/event/miyolive/index', {}, actId))
      const now = new Date()
      const { start, end, remain, title } = live
      const endTime = new Date(end)
      // deadline = end next day 12:00:00
      const deadline = new Date(endTime.getTime() + 24 * 60 * 60 * 1000 - (endTime.getTimezoneOffset() * 60 * 1000) - now.getTimezoneOffset() * 60 * 1000)
      if (deadline.getTime() < now.getTime())
        return '兑换码已经过期了'
      const startTime = new Date(start)
      let msg = `<message><p>${title}</p><img src="${imageUrl}" />`
      if (now.getTime() < startTime.getTime())
        msg += `<p>直播将于 ${TT(startTime)} 开始，剩余 ${Math.floor((startTime.getTime() - now.getTime()) / 1000 / 60)} 分钟</p>`
      else {
        if (live.remain <= 0)
          msg += `<p>（前瞻直播已经结束）</p>`
        else
          msg += `<p>（前瞻直播已经开始，剩余 ${Math.floor((endTime.getTime() - now.getTime()) / 1000 / 60)} 分钟）</p>`
        const { code_list } = (await quester<MiyouLiveCode>('https://api-takumi-static.mihoyo.com/event/miyolive/refreshCode',
          {
            version: live.code_ver,
            time: parseInt((Date.now() / 1000).toString())
          }, actId))
        msg += `<p>当前已发放 ${code_list.length} 个兑换码：</p>${code_list.map(codeBlock).join('')}`
        msg += `<p>Tips: 兑换码存在有效期，请及时兑换~</p>`
      }
      msg += '</message>'
      return msg
    })
}

function codeBlock(codeInfo: CodeList) {
  const title = codeInfo.title
    .replace(/\\/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
  return `<p>${codeInfo.code}，奖励：${title}</p>`
}

const TT = (time: Date) => Time.template('MM月dd hh时mm分ss秒', time)

const quest = (http: Quester) => async <T = any>(url: string, params: Record<string, any> = {}, actId?: string) => {
  const result = await http.get<HoyoLabRespose<T>>(url, {
    params,
    headers: actId ? {
      'x-rpc-act_id': actId,
      'Referer': 'https://webstatic.mihoyo.com',
      'Origin': 'https://webstatic.mihoyo.com',
    } : {}
  })
  return result.data
}
