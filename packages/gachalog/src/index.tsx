import { Context, Session, Schema, Logger } from "koishi";
import { } from "koishi-plugin-puppeteer";
import { StarRail } from "koishi-plugin-starrail"
import * as GachaLogType from "./type"
import * as Analyse from './analyse'
import { fetchUigfRecords, gacha } from './api'
export const uesing = ['starrail']
export const logger = new Logger('sr.gachaLog')

declare module 'koishi-plugin-starrail' {
  namespace StarRail {
    interface Database {
      link: string
      gachaLog_history: GachaLogType.Role[][]
    }

  }
}
class StarRailGachaLog {
  role: GachaLogType.Role
  uid: string
  typeName: string
  all: GachaLogType.Role[]
  data: GachaLogType.Role[][]
  type: number

  constructor(private ctx: Context, private config: StarRailGachaLog.Config) {
    ctx.on('ready',async ()=>{
      await this.sleep(5000)
      ctx.model.extend('star_rail', {
        link: 'string',
        gachaLog_history: 'json'
      })
    })
    ctx.i18n.define('zh', require('./locales/zh'))

    ctx.command('sr.gachalink <url:text>')
      .action(async ({ session }, url) => this.bind_url(session, url))
    ctx.before('attach-user', async ({ }, fields) => {
      fields.add('id')
      fields.add('sr_uid')
    })
    ctx.command('sr.gacha [uid:string]')
      .option('type', '-t <type:number>')
      .option('update', '-u')
      // .userFields(['sr_uid', 'id'])
      .action(async ({ session, options }, uid) => {
        this.type = options.type || 11
        let { user: { sr_uid, id } }: Session<"sr_uid" | 'id'> = session as Session<"sr_uid" | "id">
        if (!sr_uid && !uid) return session.text('commands.gachalog.messages.uid-no') //user表未绑定uid也没有提供uid
        if (!uid) uid = sr_uid
        if (options.update) { // 进行分析前更新记录
          const link = (await this.ctx.database.get('star_rail', { uid: [uid] }))[0]?.link
          if (!link) {
            return session.text('commands.gachalog.messages.url-no')
          }
          await this.update(session, uid, link)
        }
        // 获取历史记录
        const history: GachaLogType.Role[][] = (await this.ctx.database.get('star_rail', { uid: [uid] }))[0]?.gachaLog_history as GachaLogType.Role[][];
        if (!history) {
          return '不存在抽卡记录，请发送: sr.更新抽卡'
        }
        this.data = history
        const text: string = this.data2text()
        return text

      })
  }
  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  /**
   * 更新数据库的抽卡记录,请确保link所属uid已存在star_rail表,否则保存不到数据
   * @param session 
   * @param uid 游戏uid
   * @param link 抽卡历史链接
   * @returns 
   */

  async update(session: Session, uid: string, link: string) {
    const map: string[] = ['1', '2', '11', '12']
    const count = {
      '1': 0,
      '2': 0,
      '11': 0,
      '12': 0
    }
    const history_data: GachaLogType.Role[][] = (await this.ctx.database.get('star_rail', { uid: [uid] }))[0]?.gachaLog_history;
    if (history_data) {
      for (var i in history_data) {
        count[String(i)] = history_data[i].length;
      }
    }
    this.data = (await fetchUigfRecords(this.ctx, link, false)).list
    if (!this.data) {
      return session.text('commands.gachalog.messages.url-err')
    }
    let text: string = '更新成功\n'
    for (var i in this.data) {
      text += `${gacha[map[i]]}: ${this.data[i].length - count[map[i]]}发\n`
    }
    this.ctx.database.set('star_rail', { uid: [uid] }, { gachaLog_history: this.data })
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
      if (!id) return session.text('commands.gachalog.messages.uid-no')
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
    let { user: { sr_uid, id } }: Session<"sr_uid" | 'id'> = session as Session<"sr_uid" | "id">
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
        return session.text('commands.gachalog.messages.url-err')
      }
      uid = data[0]?.uid ? data[0].uid : data[0][0]?.uid
      if (!sr_uid) { // user表未绑定uid
        await this.ctx.database.set('user', id, { sr_uid: uid })
      }
      const account: Pick<StarRail, "uid">[] = (await this.ctx.database.get("star_rail", { uid: [uid] }))
      // 更新数据库
      if (account.length == 0) {
        await this.ctx.database.create('star_rail', { uid: uid, link: url })
      } else {
        await this.ctx.database.set('star_rail', { uid: [uid] }, { link: url })
      }
    } catch (e) {
      logger.error(String(e))
      return String(e)
    }
    const text = await this.update(session, uid, url)
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
    const res: GachaLogType.Gachadata_sep = this.randData(ans) as GachaLogType.Gachadata_sep

    if (this.config.send_as_img && this.ctx.puppeteer) {
      return this.json2img(res)
    }
    const text = JSON.stringify(res, null, 2)
    return text
  }
  json2img(history_data: GachaLogType.Gachadata_sep) {

    const fiveLog_name = [<td>角色</td>]
    const fiveLog_num = [<td>抽数</td>]
    for (var i of history_data.fiveLog) {
      const { name, num } = i
      const color = i.isUp ? '#2bc88d' : '#ff0000'
      const color_num: string = this.set_color(num)

      fiveLog_name.push(<td style={`"color:${color}"`}>{name}</td>)
      fiveLog_num.push(<td style={`"color:${color_num}"`}>{num}</td>)
    }
    return <html>
      <div >
        <div>UID: {history_data.uid}</div>
        <div>卡池: {history_data.typeName}</div>
      </div>
      <table border="1">
        <tr>
          {fiveLog_name}
        </tr>
        <tr>
          {fiveLog_num}
        </tr>
      </table>
      <div style="grid-template-columns: repeat(3, 1fr)">
        <div>总抽卡数: {history_data.allNum}</div>
        <div style={`"background-color:${this.set_color(Number(history_data.line[0][2]?.num))}"`}>平均出金: {history_data.line[0][2]?.num}</div>
        <div>小保底不歪: {history_data.line[0][3]?.num}</div>
      </div>
      <div style="grid-template-columns: repeat(3, 1fr)">
        <div>未出五星: {history_data.line[0][0].num}</div>
        <div>未出四星: {history_data.line[1][0].num}</div>
        <div>UP平均: {history_data.line[1][2].num}</div>
        <div>UP花费星琼: {history_data.line[1][3].num}</div>
      </div>
    </html>

  }
  set_color(num: number): string {
    if (!num) return '#7f6000'
    let color_num: string
    if (num < 20) {
      color_num = '#ff9900'
    } else if (num < 40) {
      color_num = '#9900ff'
    } else if (num < 60) {
      color_num = '#4a86e8'
    } else if (num < 70) {
      color_num = '#6dc845'
    } else if (num < 80) {
      color_num = '#666666'
    } else if (num < 90) {
      color_num = '#7f6000'
    }
    return color_num
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
        { lable: 'UP花费星琼', num: data.upYs, unit: '' }
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


namespace StarRailGachaLog {
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
  - -t 卡池代码

卡池代码<br>
>1: 群星跃迁<br>
2: 新手跃迁<br>
11: 限定跃迁<br>
12: 光锥跃迁<br>


抽卡历史链接获取的办法[参考这里](https://mp.weixin.qq.com/s/CzSTvRDJ3C3SVDQKPcLvVA)

## 感谢

[vikiboss](https://github.com/vikiboss/star-rail-gacha-export)
云崽
### 支持

如果你支持本项目，可以给个star，你的支持不会获得额外内容，但会提高本项目的更新积极性

本插件目前仅供学习交流使用，素材版权为米哈游所有。

您不应以任何形式使用本仓库进行盈利性活动。

对于部署者行为及所产生的任何纠纷， Koishi 及 koishi-plugin-starrail-gachalog 概不负责。

,
      // "required": ["starrail"]

`
  export interface Config {
    send_as_img: boolean
  }
  export const Config: Schema<Config> = Schema.object({
    send_as_img: Schema.boolean().default(false).description('以图片形式发送,需要puppeteer服务')
  })
}

export default StarRailGachaLog
