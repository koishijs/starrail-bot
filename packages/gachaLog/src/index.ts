import { Context, Session, Schema, Logger } from "koishi";
import { StarRail } from "koishi-plugin-starrail"
import * as GachaLogType from "./type"
import * as Analyse from './analyse'
import { fetchUigfRecords, gacha } from './api'
export const logger = new Logger('sr.抽卡分析')
export const using = ['starrail']

declare module 'koishi' {
  interface StarRail {
    id: number
    link: string
    gachaLog_history: GachaLogType.Role[][]
  }
}

class GachaLog {
  role: GachaLogType.Role
  uid: string
  typeName: string
  all: GachaLogType.Role[]
  data: GachaLogType.Role[][]
  type: number
  constructor(private ctx: Context) {
    ctx.model.extend('star_rail', {
      id: 'unsigned',
      link: 'string',
      gachaLog_history: 'json'
    })
    ctx.i18n.define('zh', require('./locales/zh'))
    ctx.starrail.subcommand('bind <uid:string>')
      .alias('星铁绑定')
      .action(async ({ session }, uid) => {
        if (!uid) {
          session.send('请输入uid')
          uid = await session.prompt()
        }
        if (!uid) return
        const session_user: Session<"id"> = session as Session<"id">
        await this.ctx.starrail.setUid(session_user.user.id, uid, true)
        return '绑定成功'
      })
    ctx.starrail.subcommand('抽卡链接 <url:text>')
      .action(async ({ session }, url) => this.bind_url(session, url))
    ctx.starrail.subcommand('抽卡分析 <type:number>')
      .option('uid', '-u <uid:string>')
      .action(async ({ session, options }, type) => this.do_anna(session, options, type))
    ctx.starrail.subcommand('更新抽卡')
      .option('uid', '-u <uid:string>')
      .action(async ({ session, options }) => this.update(session, options))

  }

  /**
   * 更新抽卡记录
   * @param session 
   * @param options 
   * @returns 
   */
  async update(session: Session, options: GachaLogType.GachaLogOpt, link?: string) {
    const { user: { id } }: Session<"id"> = session as Session<"id">

    const uid: string = options.uid ? options.uid : (await this.ctx.starrail.getUid(id))[0]?.uid
    if (!uid) {
      return session.text('gachalog.messages.uid-no')
    }
    if (!link) {
      link = (await this.ctx.database.get('star_rail', id))[0]?.link;
      if (!link) {
        return session.text('gachalog.messages.url-no')
      }
    }
    const map: string[] = ['1', '2', '11', '12']
    const count = {
      '1': 0,
      '2': 0,
      '11': 0,
      '12': 0
    }
    const history_data: GachaLogType.Role[][] = (await this.ctx.database.get('star_rail', id))[0]?.gachaLog_history;
    if (history_data) {
      for (var i in history_data) {
        count[String(i)] = history_data[i].length;
      }
    }
    this.data = (await fetchUigfRecords(this.ctx, link, false)).list
    if (!this.data) {
      return session.text('gachalog.messages.url-err')
    }
    let text: string = '更新成功\n'
    for (var i in this.data) {
      text += `${gacha[map[i]]}: ${this.data[i].length - count[map[i]]}发\n`
    }
    if ((await this.ctx.starrail.getUid(id)).length < 1) {
      this.ctx.database.create('star_rail', { gachaLog_history: this.data })
    } else {
      this.ctx.database.set('star_rail', id, { gachaLog_history: this.data })
    }
    return text
  }

  /**
   * 从数据库读取历史抽卡并分析
   * @param session 
   * @param options 
   * @param type 
   * @returns 
   */

  async do_anna(session: Session, options: GachaLogType.GachaLogOpt, type: number) {
    this.type = type ? type : 11
    let { user: { id } }: Session<"id"> = session as Session<"id">
    const uid: string = options.uid
    if (uid) {
      id = (await this.ctx.database.get('user', { sr_uid: [uid] }, ['id']))[0]?.id
      if (!id) return session.text('gachalog.messages.uid-no')
    }
    const history: GachaLogType.Role[][] = (await this.ctx.database.get('star_rail', id))[0]?.gachaLog_history as GachaLogType.Role[][];
    if (!history) {
      return '不存在抽卡记录，请发送: sr.更新抽卡'
    }
    this.data = history
    const text: string = this.data2text()
    return text
  }

  /**
   * 绑定抽卡记录链接
   * @param session 
   * @param url 
   * @returns 
   */
  async bind_url(session: Session, url: string) {
    const { user: { id } }: Session<"id"> = session as Session<"id">
    let uid: string
    if (!url) {
      session.send('请输入url')
      url = await session.prompt()
    }
    if (!url) return
    url = url.replace(/&amp;/g, "&")
    try {
      const data: GachaLogType.Role[] = (await this.ctx.http.get(url)).data?.list

      if (!data) {
        return session.text('gachalog.messages.url-err')
      }
      uid = data[0].uid ? data[0].uid : data[0][0].uid
      const account: Pick<StarRail, "uid">[] = await this.ctx.starrail.getUid(id)
      // 更新数据库
      if (account.length < 1) {
        await this.ctx.starrail.setUid(id, uid, true)
      }
      await this.ctx.database.set('star_rail', id, { link: url })
    } catch (e) {
      logger.error(String(e))
      return String(e)
    }
    const text = await this.update(session, { uid: uid }, url)
    return '绑定成功\n' + text
  }
  data2text() {
    this.uid = this.data[0][0].uid
    this.all = this.data[2]
    this.typeName = '限定'
    switch (this.type) {
      case 1:
        this.all = this.data[0]
        this.typeName = '常驻'
        break
      case 2:
        this.all = this.data[1]
        this.typeName = '新手'
        break
      case 11:
        this.all = this.data[2]
        this.typeName = '限定'
        break
      case 12:
        this.all = this.data[3]
        this.typeName = '武器'
        break
    }
    const ans: GachaLogType.Analyse_Res = Analyse.analyse(this.all, this.role)
    const res = this.randData(ans)

    const text = JSON.stringify(res, null, 2)
    return text
  }


  /** 渲染数据 */
  randData(data: GachaLogType.Analyse_Res) {
    let line = []
    if (this.type == 11) {
      line = [[
        { lable: '未出五星', num: data.noFiveNum, unit: '抽' },
        { lable: '五星', num: data.fiveNum, unit: '个' },
        { lable: '五星平均', num: data.fiveAvg, unit: '抽' },
        { lable: '小保底不歪', num: data.noWaiRate + '%', unit: '' }
      ], [
        { lable: '未出四星', num: data.noFourNum, unit: '抽' },
        { lable: '五星常驻', num: data.wai, unit: '个' },
        { lable: 'UP平均', num: data.isvalidNum, unit: '抽' },
        { lable: 'UP花费原石', num: data.upYs, unit: '' }
      ]]
    }
    // 常驻池
    if (this.type == 1) {
      line = [[
        { lable: '未出五星', num: data.noFiveNum, unit: '抽' },
        { lable: '五星', num: data.fiveNum, unit: '个' },
        { lable: '五星平均', num: data.fiveAvg, unit: '抽' },
        { lable: '五星武器', num: data.weaponNum, unit: '个' }
      ], [
        { lable: '未出四星', num: data.noFourNum, unit: '抽' },
        { lable: '四星', num: data.fourNum, unit: '个' },
        { lable: '四星平均', num: data.fourAvg, unit: '抽' },
        { lable: '四星最多', num: data.maxFour.num, unit: data.maxFour.name }
      ]]
    }
    // 武器池
    if (this.type == 12) {
      line = [[
        { lable: '未出五星', num: data.noFiveNum, unit: '抽' },
        { lable: '五星', num: data.fiveNum, unit: '个' },
        { lable: '五星平均', num: data.fiveAvg, unit: '抽' },
        { lable: '四星武器', num: data.weaponFourNum, unit: '个' }
      ], [
        { lable: '未出四星', num: data.noFourNum, unit: '抽' },
        { lable: '四星', num: data.fourNum, unit: '个' },
        { lable: '四星平均', num: data.fourAvg, unit: '抽' },
        { lable: '四星最多', num: data.maxFour.num, unit: data.maxFour.name }
      ]]
    }

    return {
      saveId: this.uid,
      uid: this.uid,
      type: this.type,
      typeName: this.typeName,
      allNum: data.allNum,
      firstTime: data.firstTime,
      lastTime: data.lastTime,
      fiveLog: data.fiveLog,
      line
    }
  }
}

namespace GachaLog {
  export const usage = `
## 目录结构
### 已经做好了的
- [x] Url导入抽卡记录
- [x] 抽卡分析
- [ ] 图像渲染（期待大佬给我做）

### 使用方法
- 绑定url
    - sr.抽卡链接 + 抽卡历史的链接
- sr.更新抽卡
- sr.抽卡分析


抽卡历史链接获取的办法[参考这里](https://mp.weixin.qq.com/s/CzSTvRDJ3C3SVDQKPcLvVA)

## 感谢

[vikiboss](https://github.com/vikiboss/star-rail-gacha-export)
云崽
### 支持

如果你支持本项目，可以给个star，你的支持不会获得额外内容，但会提高本项目的更新积极性

本插件目前仅供学习交流使用，素材版权为米哈游所有。

您不应以任何形式使用本仓库进行盈利性活动。

对于部署者行为及所产生的任何纠纷， Koishi 及 koishi-plugin-starrail-gachalog 概不负责。`
  export interface Config { }

  export const Config: Schema<Config> = Schema.object({})
}






export default GachaLog