import { Logger, Context } from "koishi";
export const logger = new Logger('sr.抽卡分析')
export const gacha = {
  '1': '群星跃迁',
  '2': '新手跃迁',
  '11': '限定跃迁',
  '12': '光锥跃迁'
} as const;
// API 参考自 https://github.com/vikiboss/star-rail-gacha-export
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
  size: number = 20,
  useProxy = false
) {
  const url = new URL(link);

  url.searchParams.set('size', String(size));
  url.searchParams.set('page', String(page));
  url.searchParams.set('gacha_type', String(type));
  url.searchParams.set('end_id', String(endId));
  url.searchParams.set('begin_id', '0');
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
  const url = createURL(link, type, 0, page, 20, useProxy)
  const data = await ctx.http.get(url);
  // 使用axios发送GET请求，并获取响应的data字段
  // 接下来可以根据需要处理响应数据  
  const result = []
  if (data?.retcode === -101) {
    logger.info('链接已失效，请重新抓取。')
    process.exit(1)
  }

  if (!data.data || !data?.data?.list) {
    logger.info('返回的数据无效，请检查跃迁链接。')
    process.exit(1)
  }
  if (data?.data?.list?.length === 0) {
    logger.info('该跃迁记录为空。')
    return []
  }
  result.push(...data.data.list)

  let endId = result[result.length - 1].id
  while (true) {
    page += 1
    await wait(2000)
    logger.info(`正在获取第 ${page} 页...`)
    const url = createURL(link, type, endId, page, 20, useProxy)
    const data = await ctx.http.get(url)
    if (!data?.data || data?.data?.list?.length === 0) {
      break
    }
    result.push(...data.data.list)
    endId = result[result.length - 1].id
  }
  return result
}
export async function fetchGachaRecords(ctx: Context, link: string, useProxy = false){
  let uid: string = ''
  let lang: string = ''
  const list = []


  for (const [type, name] of Object.entries(gacha)) {
    logger.info(`开始获取 「${name}」 ...`)

    const rawRecords = await fetchRecordsByGachaType(ctx, link, type, useProxy)
    list.push(rawRecords)

    if (!rawRecords) {
      logger.info(`「${name}」 记录为空`)
    } else {
      logger.info(`共获取到 ${rawRecords.length} 条 「${name}」 记录`)
    }
  }
  return list
}

// import 'axios'
/**
 * 
 * link: string,
 * type: string | number = 1,
 * endId: number | string = 0,
 * page: number = 1,
 * size: number = 10,
 */
// const url = createURL('https://api-takumi.mihoyo.com/common/gacha_record/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&win_mode=fullscreen&gacha_id=4a59ab6e4f20fde5701402a1b8c72f609200a2&timestamp=1686096286&region=prod_gf_cn&default_gacha_type=11&lang=zh-cn&authkey=RPyZQhNJeCt31PBCivRH4dq3%2FGa%2BV7u3VhPD7JSOZ9A59TQArAQkHdF%2FMiA4%2BPYcgRGieUfsmOjgANBJ0s1CHTHjywkykHtoNkim1eHARQnOY%2FUrEfmPeU%2FgSTCdfg7QuAcwBoQE9g8EGJL9ymt93yNRLXIjE9pB8s6wHRHrtuVbaz7m4OpV%2BwayCmR77Kzm%2B2SZT1ka%2FtB8YkrEwr0txtGWYKrSf3vMBca5LLWgI6dVqGx%2F%2BB3yAPZ4f0uKIF4OD0MpehTpoSSA1Bk7isMv6ml8lO4aTW0uCmBQCbd5btNBNj468yuGcG3W2HYFpmkIXIwd53ZzKUf1Rf9itAl9DQnLbuNtiu6O9ZepBnp6ndo1AqyQ5jLA5vwzbmVqmhKC8C5BsAs3Bk7V3e9%2F0Z97Afkp0Z3TodqOTor2MIwnPWLK7lQTlb7Lz%2FEn%2B%2BO8k9Bbtc7se7KtWRVAG3fzDdgx1E9n4m1mGFWH%2Fm38VhxZ5nvJ6rNwk2lDBevuU31Bfu5sQ1tpEMSueIlhFaX5KmajGCb8hFR1Y5XrpaGnl0D0Svs%2FQd0svHGFIrf6j1lUVbj%2B6Qhz1Ri8G0D3ONHxX3F7XzfnYi721LyDmouYu9uErx6g1Vhb493vJPXn8Nw9XW6b6SwbQUUADnqvjVonpZBrRg8axrlfmCvbvyRGmn9oV4M%3D&game_biz=hkrpg_cn&os_system=Android%20OS%2011%20%2F%20API-30%20%28RQ1A.210105.003%2Feng.zhully.20210120.055857%29&device_model=Xiaomi%20MI%208&plat_type=android&page=1&size=5&gacha_type=11&begin_id=1686179400000067045',
// 1,'1686201000001455845',2,20)
// console.log(url)