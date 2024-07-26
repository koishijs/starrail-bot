import { Context, Schema, Session, h, Dict } from 'koishi'
export const name = 'starrail-atlas'
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import fs, { readFileSync } from 'fs';
class StarRailAtlas {
  othername: Dict = {}
  path_dict: Dict = {}
  relic_dict: Dict = {}
  role_dict: Dict = {}
  lightcone_dict: Dict = {}
  enemy_dict: Dict = {}
  alias: Dict = {}
  constructor(private ctx: Context, private config: StarRailAtlas.Config) {
    ctx.i18n.define('zh', require('./locales/zh'))
    ctx.on('ready', this.initialize.bind(this))

    for (let [key, alias_class] of Object.entries(config.alias)) {
      ctx.command(this.ctx.config.prefix + alias_class[0], `星铁${alias_class[0]}图鉴`)
        .alias(...(alias_class.length > 1 ? alias_class.slice(1, alias_class.length) : [])
        ).action(({ session }, ...args) => {
          let path: string
          const name = args[0]
          switch (key) {
            case 'role':
              if (!this.role_dict[name]) return session.text('commands.update.messages.notfound')
              path = '/role/' + this.role_dict[name] + '.png'
              break
            case 'relic':
              if (!this.relic_dict[name]) return session.text('commands.update.messages.notfound')
              path = '/relic/' + this.relic_dict[name] + '.png'
              break
            case 'lightcone':
              if (!this.lightcone_dict[name]) return session.text('commands.update.messages.notfound')
              path = '/lightcone/' + this.lightcone_dict[name] + '.png'
              break
            case 'enemy':
              if (!this.enemy_dict[name]) return session.text('commands.update.messages.notfound')
              path = this.enemy_dict[name]
              break
            case 'guide for role':
              if (!this.role_dict[name]) return session.text('commands.update.messages.notfound')
              path = '/guide for role/' + this.role_dict[name] + '.png'
              break
          }
          let img_url: string
          if (config.engine) {
            img_url = this.config.repo + path
          } else {
            img_url = pathToFileURL(resolve(this.config.src_path + path)).href
          }
          console.log(img_url)
          return h.image(img_url)
        })

    }
    ctx.command('sr.atlas', '更新图鉴索引').alias('更新图鉴索引').action(({ session }) => this.update(session))
  }
  async initialize() {
    this.othername = require(resolve(__dirname, 'othername.json'))
    this.path_dict = require(resolve(__dirname, 'path.json'))
    // relic
    for (let id of Object.keys(this.othername['relic'])) {
      for (let othername of this.othername['relic'][id]) {
        this.relic_dict[othername] = id
      }
      this.relic_dict[id] = id
    }

    // role
    for (let id of Object.keys(this.othername['role'])) {
      for (let othername of this.othername['role'][id]) {
        this.role_dict[othername] = id
      }
      this.role_dict[id] = id
    }

    // lightcone
    for (let id of Object.keys(this.othername['lightcone'])) {
      for (let othername of this.othername['lightcone'][id]) {
        this.lightcone_dict[othername] = id
      }
      this.lightcone_dict[id] = id
    }

    // enemy
    this.enemy_dict = this.path_dict['enemy']

    for (let alias_class of Object.keys(this.ctx.config.alias)) {
      for (let alias of this.ctx.config.alias[alias_class]) {
        this.alias[alias] = alias_class
      }
    }
  }
  async update(session: Session) {
    const res = await this.ctx.http.get('https://gitee.com/Nwflower/star-rail-atlas/raw/master/path.json', { responseType: 'arraybuffer' })
    fs.writeFileSync('./node_modules/koishi-plugin-starrail-atlas/lib/path.json', Buffer.from(res))
    const res2 = await this.ctx.http.get('https://gitee.com/Nwflower/star-rail-atlas/raw/master/othername.json', { responseType: 'arraybuffer' })
    fs.writeFileSync('./node_modules/koishi-plugin-starrail-atlas/lib/othername.json', Buffer.from(res2))
    await this.initialize()
    return session.text('commands.update.messages.success')
  }
}
namespace StarRailAtlas {
  export const usage = `${readFileSync(resolve(__dirname, '../readme.md')).toString('utf-8').split('更新日志')[0]}`
  export interface Config {
    prefix: string
    src_path: string
    engine: boolean
    repo: string
    alias: {
      role: string[]
      enemy: string[]
      lightcone: string[]
      'guide for role': string[]
      relic: string[]
    }
  }
  export const Alias = Schema.object({
    role: Schema.array(String).default(['角色']).description('角色'),
    enemy: Schema.array(String).default(['怪', 'boss']).description('敌人'),
    lightcone: Schema.array(String).default(['光锥']).description('光锥'),
    'guide for role': Schema.array(String).default(['角色攻略']).description('角色攻略'),
    relic: Schema.array(String).default(['遗器']).description('遗器'),
  })

  export const Config: Schema<Config> =
    Schema.object({
      prefix: Schema.string().default('#').description('匹配命令的前缀字符'),
      engine: Schema.boolean().default(true).description('是否使用在线引擎'),
      src_path: Schema.string().default('star-rail-atlas').description('资源文件的路径'),
      repo: Schema.string().default('https://gitee.com/Nwflower/star-rail-atlas/raw/master').description('gitee在线资源的地址'),
      alias: Alias,
    }).description('进阶设置')

}

export default StarRailAtlas