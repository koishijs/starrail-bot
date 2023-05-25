export interface Role {
    uid: string
    gacha_id: string
    gacha_type: string
    item_id: string
    count: string
    time: string
    name: string
    lang: string
    item_type: string
    rank_type: string
    id: string
}
export interface Analyse_Res {
    allNum: number
    noFiveNum: number
    noFourNum: number
    fiveNum: number
    fourNum: number
    fiveAvg: number
    fourAvg: number
    wai: number
    isvalidNum: number
    maxFour: { name: string, num: number }
    weaponNum: number
    weaponFourNum: number
    firstTime: string
    lastTime: string
    fiveLog: any[]
    upYs: string
    noWaiRate: string | number
}
export interface GachaLogOpt {
    uid?:string
}