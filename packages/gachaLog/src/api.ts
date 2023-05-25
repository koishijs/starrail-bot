import { Logger, Context } from "koishi";
export const logger = new Logger('sr.抽卡分析')
export const gacha = {
    '1': '群星跃迁',
    '2': '新手跃迁',
    '11': '限定跃迁',
    '12': '光锥跃迁'
} as const;
// API 参考自 https://github.com/vikiboss/star-rail-gacha-export
const pkg = require('../package.json')
export function timestamp(type?: 'unix'): number {
    return type === 'unix' ? Date.now() / 1000 : Date.now();
}
export function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function createURL(
    link: string,
    type: string | number = 1,
    endId: number | string = 0,
    page: number = 1,
    size: number = 10,
    useProxy = false
) {
    const url = new URL(link);

    url.searchParams.set('size', String(size));
    url.searchParams.set('page', String(page));
    url.searchParams.set('gacha_type', String(type));
    url.searchParams.set('end_id', String(endId));
    if (useProxy) {
        const host = url.host;
        url.host = 'proxy.viki.moe';
        url.searchParams.set('proxy-host', host);
    }

    return url.href;
}
async function fetchRecordsByGachaType(
    ctx: Context,
    link: string,
    type: number | string,
    useProxy = false
) {
    let page = 1;

    logger.info(`开始获取 第 ${page} 页...`);
    const data = await ctx.http.get(createURL(link, type, 0, page, 20, useProxy));
    // 使用axios发送GET请求，并获取响应的data字段

    // 接下来可以根据需要处理响应数据  
    const result = []

    if (!data.data?.list) {
        logger.info('链接可能已失效，请重新抓取！')
    }

    result.push(...data.data.list)

    let endId = result[result.length - 1].id
    while (true) {
        page += 1
        await wait(200)
        logger.info((`开始获取 第 ${page} 页...`))
        const data = await ctx.http.get(createURL(link, type, endId, page, 20, useProxy))
        if (!data?.data || data?.data?.list?.length === 0) {
            break
        }

        result.push(...data.data.list)
        endId = result[result.length - 1].id
    }

    return result
}
async function fetchGachaRecords(ctx: Context, link: string, useProxy = false) {
    const res = []

    for (const [type, name] of Object.entries(gacha)) {
        logger.info(`开始获取 「${name}」 跃迁记录...`)
        const records = await fetchRecordsByGachaType(ctx, link, type, useProxy)
        res.push(records)
        logger.info(`共获取到 ${records.length} 条 「${name}」 记录`)
    }

    return res
}

export async function fetchUigfRecords(ctx: Context, link: string, useProxy = false) {
    const list = await fetchGachaRecords(ctx, link, useProxy)
    const uid = list?.[0]?.[0]?.uid
    if (!uid) {
        return null
    }
    const info = {
        uid,
        lang: 'zh-CN',
        export_timestamp: timestamp(),
        export_app: pkg?.name,
        export_app_version: `v${pkg?.version}`,
        uigf_version: 'v2.3'
    }

    return { info, list } as const
}