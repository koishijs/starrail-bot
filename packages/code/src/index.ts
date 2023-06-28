import { Context, Logger, Quester, Schema, Session, Time } from 'koishi'

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
  ctx.on('ready', () => {

  })

  let HoyoOfficalActId: string
  ctx.command('sr.code 获取前瞻直播兑换码')
    .action(async ({ session }) => {
      const quester = quest(ctx.http, session)
      session.send('正在查找最近的前瞻直播')
      HoyoOfficalActId = getActId(await quester<HoyoLab>('https://bbs-api.mihoyo.com/painter/api/user_instant/list', { offset: 0, size: 20, uid: '288909600' }))
      if (HoyoOfficalActId) {
        // const indexRes = await quester<any>('https://api-takumi.mihoyo.com/event/bbslive/index', { act_id: HoyoOfficalActId })
        // if (!indexRes.mi18n) return 'mi18n 未找到'
        // const mi18nRes = await quester<any>(`https://webstatic.mihoyo.com/admin/mi18n/bbs_cn/${indexRes.mi18n}/${indexRes.mi18n}-zh-cn.json`)
        // const codeRes = await quester<any>(`https://webstatic.mihoyo.com/bbslive/code/${HoyoOfficalActId}.json`, { act_id: HoyoOfficalActId, time: Date.now(), version: 1 })
        const codeRes = (await quester<any>('https://api-takumi-static.mihoyo.com/event/miyolive/refreshCode', {}, { 'x-rpc-act_id': HoyoOfficalActId }))['code_list']
        // if (indexRes.remain || !codeRes) {
        //   await session.send(`<image url={mi18nRes['pc-kv']} timeout="32000"/>`)
        //   session.send('预计第一个兑换码发送时间为：' + Time.format(mi18nRes['time1'] as number))
        // }
        if (codeRes) {
          let code = `<message><p>当前共发放了 ${codeRes.length} 个兑换码</p>`
          codeRes.forEach(codeInfo => {
            code += `<p>${codeInfo['code']}</p>`
          })
          await session.send(code + `<p>Tips: 兑换码存在有效期，请及时兑换哦~</p></message>`)
        }
      } else {
        return '近期没有前瞻直播哦'
      }
    })
}

function quest(http: Quester, session?: Session) {
  const headers = {
    origin: 'https://webstatic.mihoyo.com',
    referer: 'https://webstatic.mihoyo.com/',
  }
  return async <T>(url: string, params?: Quester.AxiosRequestConfig['params'], header: Record<string, any> = {}): Promise<T> => {
    header = Object.assign(headers, header)
    try {
      const data = await http<HoyoLabRespose<T>>('GET', url, { params, headers })
      if (Object.keys(data).includes('retcode')) {
        if (data.retcode !== 0) {
          logger.error(`request ${url},%o  error[code${data.retcode}]: ${data.message}`, { params, headers })
          if (session)
            session.send(`请求 API 错误(${data.retcode})：${data.message}`)
          return
        }
        return data.data
      } else {
        return data as T
      }
    } catch (e) {
      logger.error(`request ${url} error: ${e}`)
      throw Error(e)
    }
  }
}

function getActId(res: HoyoLab): string {
  let actid: string;
  const oneDay = 24 * 60 * 60 * 1000
  res.list.forEach(list => {
    const post = list?.post?.post
    if (/([0-9].[0-9])版本前瞻特别节目(.+)开启/gm.test(post.subject) && (Math.round(new Date().getTime() / 1000) - post.created_at) < (24 * 60 * 60 * 5))
      (JSON.parse(post.structured_content) as any[]).forEach(ele => {
        if (ele['attributes'])
          if (ele['attributes']['link']) {
            const link = new URL(ele['attributes']['link']).searchParams.get('act_id')
            if (link && !/(\d{8}ys\d{4})/g.test(link)) {
              actid = link
              return
            }
          }
      })
  })
  return actid
}
