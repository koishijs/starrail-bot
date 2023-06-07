import { Context, Schema, Service } from 'koishi'
import StarRailDatabase from './internal/database'
import StarRailCommander from './internal/command'
declare module 'koishi' {
  interface Context {
    starrail: HonkaiStarRail & HonkaiStarRail.Mixins
  }
}

class HonkaiStarRail extends Service {
  static using = ['database']
  constructor(private app: Context, config: HonkaiStarRail.Config) {
    super(app, 'starrail', true)
    // install the base command of first
    app.command('sr').action(async ({ session }) => session.execute('help sr'))
    // apply all internal plugins constructorer via mixin
    this.mixin([StarRailDatabase, StarRailCommander])
    app.on('ready', () => {
      // apply internal plugins.
      app.plugin(StarRailDatabase)
      app.plugin(StarRailCommander, config)
    })
  }

  protected mixin(constructorers: any[]) {
    constructorers.forEach((ctor) => {
      Object.getOwnPropertyNames(ctor.prototype).forEach((name) => {
        Object.defineProperty(
          HonkaiStarRail.prototype,
          name,
          Object.getOwnPropertyDescriptor(ctor.prototype, name) ||
          Object.create(null)
        );
      });
    })
  }
}

namespace HonkaiStarRail {
  interface BaseConfig { }
  const BaseConfig: Schema<BaseConfig> = Schema.object({})

  export type Config = BaseConfig & StarRailCommander.Config;
  export const Config: Schema<Config> = Schema.intersect([BaseConfig, StarRailCommander.Config])

  export type Collapse<T> = Pick<T, {
    [K in keyof T]: T[K] extends Function | number | string | boolean ? K : never;
  }[keyof T]>
  export type Mixins = Collapse<StarRailDatabase> & Collapse<StarRailCommander>
}

export * from './internal/database'
export default HonkaiStarRail
