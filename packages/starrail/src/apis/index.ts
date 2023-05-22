import { Logger, Quester } from 'koishi';
import { Region } from '../utils/Region';
import { APIRegion, APIRequestMethod, APIStencil } from '../interface/BasicAPI.interface';

type ApiDefineReturn<N> = N extends 'bbs' ? (path: string, hostBy: string | '', region: Region, cookie?: boolean) => never : (path: string, config?: Quester.AxiosRequestConfig) => never

namespace Api {
    export type Parames = Record<string, any>
    export type Function = (params: Parames) => Promise<any>
    export type Functional = Record<string, Function>
    export interface Namespace { }
    export type NK = keyof Namespace
    export type QuestBase = {
        [K in NK]?: K extends 'bbs' ? APIRegion : string | Record<string, string>
    }

    export type Constructor<K extends NK> = Namespace[K]
}

class Api<N extends Api.NK> {
    constructor(private http: Quester, private namespace: N) { }

    public static questBase: Api.QuestBase = {}
    private static __bbsApis: APIStencil = {}
    private static logger: Logger = new Logger('genshin')
    private logger: Logger = Api.logger

    private static __api__: Record<Api.NK, any> = {
        bbs: {},
        enka: ''
    }

    private _taskCount = 0
    private _taskQueue = []

    private respose(res: any) {
        this.logger.debug(`[api:${this.namespace}] Respose: %o`, res)
        if (this.namespace === 'bbs') {
            const { } = res
        } else {
            const { } = res
        }

    }

    private limitQuest(simult: number) {
        return async <T>(caller: (...args: any[]) => Promise<T>) => new Promise<T>((resolve, reject) => {
            const _t = this.__createTask(caller, resolve, reject)
            if (this._taskCount >= simult) this._taskQueue.push(_t)
            else _t()
        })
    }

    private __createTask = <T>(caller: (...args: any[]) => Promise<T>, resolve: (value: any | PromiseLike<any>) => void, reject: (reason?: any) => void) => () => {
        caller()
            .then(resolve)
            .catch(reject)
            .finally(() => {
                this._taskCount--
                const _t = this._taskQueue.shift()
                _t()
            })
        this._taskCount++
    }

    static define<N extends Api.NK>(namespace: N, name: string, method: APIRequestMethod): ApiDefineReturn<N> {
        if (!Object.keys(this.__api__).includes(namespace))
            this.__api__[namespace] = {}
        return ((...args) => {
            let path = args[0]
            const _EPath = /^\/(.+)/g
            const _EUrl = /^htt(p|ps)\:\/\//g
            const _EParamPath = /\{(.*)+\}/g

            if (namespace === 'bbs') {
                //eliminate duplicates
                if (this.__bbsApis[name]) {
                    if (this.__bbsApis[name]['availableFor'].includes(args[2])) return;
                    this.__bbsApis[name]['availableFor'].push(args[2])
                    this.__bbsApis[name]['method'] = method
                    this.__bbsApis[name]['url'][args[2]] = args[0]
                    this.__bbsApis[name]['cookie'] = args[3] || false
                    if (args[1] !== '') this.__bbsApis[name]['hostBy'][args[2]] = args[1]
                }
            }

            async function bbsQuester(this: Api<N>, ...args: any[]) {
                const conf: Quester.AxiosRequestConfig = {}
                if (method === 'GET') {
                    conf.params = args[0]
                } else {
                    conf.data = args[0]
                }
                //限制请求并发以避免米游社风控
                return this.limitQuest(3)(() => this.http(method, path, conf))
            }

            async function basicQuester(this: Api<N>, ...args: any[]) {
                const conf: Quester.AxiosRequestConfig = {}
                if (method === 'GET') {
                    conf.params = args[0]
                } else {
                    conf.data = args[0]
                }
                return this.http(method, path, conf)
            }

            Object.assign(this.__api__[namespace], { [name]: namespace === 'bbs' ? bbsQuester : basicQuester })
            this.logger.debug(`[api:${namespace}]: add api definition of '${name}'`)
        }) as ApiDefineReturn<N>
    }

    quest(): Api.Constructor<N> {
        if (!Api.__api__[this.namespace as Api.NK]) throw Error(`[api] Unknown namespace: ${this.namespace}`)
        return Api.__api__[this.namespace as Api.NK]
    }
}

export { Api }
