import { Context, Schema, Session, h, Dict } from 'koishi'
export const name = 'starrail-atlas'
import { resolve } from "path";
import { pathToFileURL } from "url";
import fs, { readFileSync } from 'fs';
class StarRailAtlas {
  path_data: Dict
  path_dict: Dict
  name_list: string[]
  constructor(private ctx: Context, private config: StarRailAtlas.Config) {
    ctx.i18n.define('zh', require('./locales/zh'))
    ctx.on('ready', async () => {
      this.path_data = require(resolve(__dirname, 'path.json'))
      this.path_dict = {}
      let keys = ['relic', 'role', 'lightcone', 'guide for role', 'enemy'];
      let keyMapping = {
        'guide for role': '攻略'
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
  export const usage = `${readFileSync(resolve(__dirname, '../readme.md')).toString('utf-8').split('更新日志')[0]}`
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