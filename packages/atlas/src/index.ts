import { Context, Schema, Session, h, Dict } from 'koishi'
export const name = 'star-rail-atlas'
import { resolve } from "path";
import { pathToFileURL } from "url";
import fs from 'fs';
class Atlas {
    path_data: Dict
    path_dict: Dict
    name_list: string[]
    constructor(private ctx: Context, private config: Atlas.Config) {
        ctx.i18n.define('zh',require('./locales/zh'))
        ctx.on('ready', async () => {
            this.path_data = {
                "role": {
                  "三月七": "/role/三月七.png",
                  "白露": "/role/白露.png",
                  "桑博": "/role/桑博.png",
                  "佩拉": "/role/佩拉.png",
                  "物理开拓者": "/role/物理开拓者.png",
                  "希儿": "/role/希儿.png",
                  "娜塔莎": "/role/娜塔莎.png",
                  "彦卿": "/role/彦卿.png",
                  "克拉拉": "/role/克拉拉.png",
                  "火开拓者": "/role/火开拓者.png",
                  "布洛妮娅": "/role/布洛妮娅.png",
                  "阿兰": "/role/阿兰.png",
                  "杰帕德": "/role/杰帕德.png",
                  "黑塔": "/role/黑塔.png",
                  "青雀": "/role/青雀.png",
                  "丹恒": "/role/丹恒.png",
                  "姬子": "/role/姬子.png",
                  "素裳": "/role/素裳.png",
                  "虎克": "/role/虎克.png",
                  "停云": "/role/停云.png",
                  "希露瓦": "/role/希露瓦.png",
                  "景元": "/role/景元.png",
                  "瓦尔特": "/role/瓦尔特.png",
                  "艾丝妲": "/role/艾丝妲.png"
                },
                "material for role": {
                  "三月七": "/material for role/三月七.png",
                  "白露": "/material for role/白露.png",
                  "桑博": "/material for role/桑博.png",
                  "佩拉": "/material for role/佩拉.png",
                  "物理开拓者": "/material for role/物理开拓者.png",
                  "希儿": "/material for role/希儿.png",
                  "娜塔莎": "/material for role/娜塔莎.png",
                  "彦卿": "/material for role/彦卿.png",
                  "克拉拉": "/material for role/克拉拉.png",
                  "火开拓者": "/material for role/火开拓者.png",
                  "布洛妮娅": "/material for role/布洛妮娅.png",
                  "阿兰": "/material for role/阿兰.png",
                  "杰帕德": "/material for role/杰帕德.png",
                  "黑塔": "/material for role/黑塔.png",
                  "青雀": "/material for role/青雀.png",
                  "丹恒": "/material for role/丹恒.png",
                  "姬子": "/material for role/姬子.png",
                  "素裳": "/material for role/素裳.png",
                  "虎克": "/material for role/虎克.png",
                  "停云": "/material for role/停云.png",
                  "希露瓦": "/material for role/希露瓦.png",
                  "景元": "/material for role/景元.png",
                  "瓦尔特": "/material for role/瓦尔特.png",
                  "艾丝妲": "/material for role/艾丝妲.png"
                },
                "lightcone": {
                  "渊环": "/lightcone/渊环.png",
                  "物穰": "/lightcone/物穰.png",
                  "延长记号": "/lightcone/延长记号.png",
                  "镂月裁云之意": "/lightcone/镂月裁云之意.png",
                  "于夜色中": "/lightcone/于夜色中.png",
                  "调和": "/lightcone/调和.png",
                  "无可取代的东西": "/lightcone/无可取代的东西.png",
                  "一场术后对话": "/lightcone/一场术后对话.png",
                  "记一位星神的陨落": "/lightcone/记一位星神的陨落.png",
                  "俱殁": "/lightcone/俱殁.png",
                  "但战斗还未结束": "/lightcone/但战斗还未结束.png",
                  "戍御": "/lightcone/戍御.png",
                  "天倾": "/lightcone/天倾.png",
                  "春水初生": "/lightcone/春水初生.png",
                  "无处可逃": "/lightcone/无处可逃.png",
                  "相抗": "/lightcone/相抗.png",
                  "此时恰好": "/lightcone/此时恰好.png",
                  "以世界之名": "/lightcone/以世界之名.png",
                  "朗道的选择": "/lightcone/朗道的选择.png",
                  "早餐的仪式感": "/lightcone/早餐的仪式感.png",
                  "记忆中的模样": "/lightcone/记忆中的模样.png",
                  "锋镝": "/lightcone/锋镝.png",
                  "「我」的诞生": "/lightcone/「我」的诞生.png",
                  "拂晓之前": "/lightcone/拂晓之前.png",
                  "余生的第一天": "/lightcone/余生的第一天.png",
                  "银河铁道之夜": "/lightcone/银河铁道之夜.png",
                  "智库": "/lightcone/智库.png",
                  "点个关注吧！": "/lightcone/点个关注吧！.png",
                  "舞！舞！舞！": "/lightcone/舞！舞！舞！.png",
                  "离弦": "/lightcone/离弦.png",
                  "灵钥": "/lightcone/灵钥.png",
                  "猎物的视线": "/lightcone/猎物的视线.png",
                  "后会有期": "/lightcone/后会有期.png",
                  "乐圮": "/lightcone/乐圮.png",
                  "别让世界静下来": "/lightcone/别让世界静下来.png",
                  "我们是地火": "/lightcone/我们是地火.png",
                  "晚安与睡颜": "/lightcone/晚安与睡颜.png",
                  "在蓝天下": "/lightcone/在蓝天下.png",
                  "开疆": "/lightcone/开疆.png",
                  "制胜的瞬间": "/lightcone/制胜的瞬间.png",
                  "今日亦是和平的一日": "/lightcone/今日亦是和平的一日.png",
                  "记忆的质料": "/lightcone/记忆的质料.png",
                  "如泥酣眠": "/lightcone/如泥酣眠.png",
                  "齐颂": "/lightcone/齐颂.png",
                  "嘉果": "/lightcone/嘉果.png",
                  "天才们的休憩": "/lightcone/天才们的休憩.png",
                  "同一种心情": "/lightcone/同一种心情.png",
                  "唯有沉默": "/lightcone/唯有沉默.png",
                  "这就是我啦！": "/lightcone/这就是我啦！.png",
                  "睿见": "/lightcone/睿见.png",
                  "秘密誓心": "/lightcone/秘密誓心.png",
                  "幽邃": "/lightcone/幽邃.png",
                  "匿影": "/lightcone/匿影.png",
                  "星海巡航": "/lightcone/星海巡航.png",
                  "过往未来": "/lightcone/过往未来.png",
                  "与行星相会": "/lightcone/与行星相会.png",
                  "琥珀": "/lightcone/琥珀.png",
                  "重返幽冥": "/lightcone/重返幽冥.png",
                  "蕃息": "/lightcone/蕃息.png",
                  "轮契": "/lightcone/轮契.png",
                  "暖夜不会漫长": "/lightcone/暖夜不会漫长.png",
                  "时节不居": "/lightcone/时节不居.png",
                  "论剑": "/lightcone/论剑.png",
                  "鼹鼠党欢迎你": "/lightcone/鼹鼠党欢迎你.png",
                  "决心如汗珠般闪耀": "/lightcone/决心如汗珠般闪耀.png",
                  "宇宙市场趋势": "/lightcone/宇宙市场趋势.png",
                  "等价交换": "/lightcone/等价交换.png",
                  "汪！散步时间！": "/lightcone/汪！散步时间！.png"
                },
                "relic": {
                  "盗匪荒漠的废土客": "/relic/盗匪荒漠的废土客.png",
                  "繁星璀璨的天才": "/relic/繁星璀璨的天才.png",
                  "激奏雷电的乐队": "/relic/激奏雷电的乐队.png",
                  "太空封印站": "/relic/太空封印站.png",
                  "熔岩锻铸的火匠": "/relic/熔岩锻铸的火匠.png",
                  "净庭教宗的圣骑士": "/relic/净庭教宗的圣骑士.png",
                  "晨昏交界的翔鹰": "/relic/晨昏交界的翔鹰.png",
                  "野穗伴行的快枪手": "/relic/野穗伴行的快枪手.png",
                  "筑城者的贝洛伯格": "/relic/筑城者的贝洛伯格.png",
                  "星体差分机": "/relic/星体差分机.png",
                  "盗贼公国塔利亚": "/relic/盗贼公国塔利亚.png",
                  "密林卧雪的猎人": "/relic/密林卧雪的猎人.png",
                  "泛银河商业公司": "/relic/泛银河商业公司.png",
                  "戍卫风雪的铁卫": "/relic/戍卫风雪的铁卫.png",
                  "生命的翁瓦克": "/relic/生命的翁瓦克.png",
                  "云无留迹的过客": "/relic/云无留迹的过客.png",
                  "停转的萨尔索图": "/relic/停转的萨尔索图.png",
                  "街头出身的拳王": "/relic/街头出身的拳王.png",
                  "流星追迹的怪盗": "/relic/流星追迹的怪盗.png",
                  "不老者的仙舟": "/relic/不老者的仙舟.png"
                }
              }
            this.path_dict = {}
            let keys = ['relic', 'role', 'lightcone', 'material for role'];
            let keyMapping = {
                'material for role': '材料'
            };
            this.name_list = [];
            for (let key of keys) {
                let list = Object.keys(this.path_data[key]);
                list.map(i => {
                    this.path_dict[i + (keyMapping[key] || '')] = this.path_data[key][i];
                });
                Array.prototype.push.apply(this.name_list, list);
            }
        })
        ctx.middleware((session, next) => {
            const path = this.findpath(session.content);
            if (path == '') return next();
            let img_url: string
            if (config.engine) {
                img_url = this.config.repo + path
            } else {
                img_url = pathToFileURL(resolve(__dirname, this.config.src_path + path)).href
            }
            return h.image(img_url);
        })
        // ctx.command('update', '更新图鉴索引').action(({ session }) => this.update(session))
    }
    async update(session: Session) {
        const res = await this.ctx.http.get('https://gitee.com/Nwflower/star-rail-atlas/raw/master/path.json', { responseType: 'arraybuffer' })
        fs.writeFileSync('./node_modules/koishi-plugin-star-rail-atlas/lib/path.json', res)
        return session.text('commands.update.messages.success')
    }
    findpath(cmd: string): string {
        if (!(cmd.startsWith(this.config.prefix))) return ""
        const name = cmd.replace(this.config.prefix, '')
        const path = this.path_dict[name]
        return path ? path : ""
    }
}
namespace Atlas {
    export interface Config {
        prefix: string
        src_path: string
        engine: boolean
        repo: string
    }
    export const Config = 
        Schema.object({
            prefix: Schema.string().default('#').description('匹配命令的前缀字符'),
            engine: Schema.boolean().default(true).description('是否使用在线引擎'),
            src_path: Schema.string().default('../../../star-rail-atlas').description('资源文件的路径'),
            repo: Schema.string().default('https://gitee.com/Nwflower/star-rail-atlas/raw/master').description('gitee在线资源的地址'),
        }).description('进阶设置')

}

export default Atlas