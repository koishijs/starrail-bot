import { Context, Schema, Session, h, Dict } from 'koishi'
export const name = 'starrail-atlas'
import { resolve } from "path";
import { pathToFileURL } from "url";
import fs from 'fs';
class StarRailAtlas {
  path_data: Dict
  path_dict: Dict
  name_list: string[]
  constructor(private ctx: Context, private config: StarRailAtlas.Config) {
    ctx.i18n.define('zh', require('./locales/zh'))
    ctx.on('ready', async () => {
      this.path_data = require(resolve(__dirname,'path.json'))
      this.path_dict = {}
      let keys = ['relic', 'role', 'lightcone', 'material for role','enemy'];
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
        img_url = pathToFileURL(resolve(this.config.src_path + path)).href
      }
      return h.image(img_url);
    })
    ctx.command('sr.atlas', '更新图鉴索引').alias('更新图鉴索引').action(({ session }) => this.update(session))
  }
  async update(session: Session) {
    const res = await this.ctx.http.get('https://gitee.com/Nwflower/star-rail-atlas/raw/master/path.json', { responseType: 'arraybuffer' })
    fs.writeFileSync('./node_modules/koishi-plugin-starrail-atlas/lib/path.json', res)
    return session.text('commands.update.messages.success')
  }
  findpath(cmd: string): string {
    if (!(cmd.startsWith(this.config.prefix))) return ""
    const name = cmd.replace(this.config.prefix, '')
    const path = this.path_dict[name]
    return path ? path : ""
  }
}
namespace StarRailAtlas {
  export const usage = `
> 如未启用在线引擎，请在前往 <a style="color:blue" href="https://gitee.com/Nwflower/star-rail-atlas/tree/master/role">Nwflower/star-rail-atlas</a> 中下载资源文件并解压<br>
并填写资源文件的路径<br>
本图鉴目前仅供学习交流使用，素材版权为米哈游所有。<br>
对于部署者行为及所产生的任何纠纷， Koishi 及 koishi-plugin-star-rail-atlas 概不负责。
- 角色图鉴
    - #三月七
- 光锥图鉴
    - #此时恰好
- 角色材料
    - #三月七材料
- 更新图鉴
    - update
## 问题反馈
* QQ群：399899914<br>
* 小伙伴如果遇到问题或者有新的想法，欢迎到[这里](https://github.com/initialencounter/mykoishi/issues)反馈哦~
`;
  export interface Config {
    prefix: string
    src_path: string
    engine: boolean
    repo: string
  }
  export const Config: Schema<Config> =
    Schema.object({
      prefix: Schema.string().default('#').description('匹配命令的前缀字符'),
      engine: Schema.boolean().default(true).description('是否使用在线引擎'),
      src_path: Schema.string().default('star-rail-atlas').description('资源文件的路径'),
      repo: Schema.string().default('https://gitee.com/Nwflower/star-rail-atlas/raw/master').description('gitee在线资源的地址'),
    }).description('进阶设置')

}

export default StarRailAtlas