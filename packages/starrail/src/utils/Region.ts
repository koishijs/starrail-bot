export enum RegionType {
    CN = 'cn_gf01',
    CNB = 'cn_qd01',
    CHT = 'os_cht',
    EU = 'os_euro',
    AS = 'os_asia',
    US = 'os_usa'
}

export type Region = 'cn' | 'os'

export type GetRegion<
    U extends `${number}` | RegionType
> =
    U extends `${number}`
    ? GetRegionType<U> extends RegionType.CN | RegionType.CNB ? 'cn' : 'os'
    : U extends RegionType.CN | RegionType.CNB ? 'cn' : 'os'

export type GetRegionType<
    U extends `${number}`
> =
    U extends `${infer C}${infer O}`
    ? C extends '1' | '2'
    ? RegionType.CN
    : C extends '5'
    ? RegionType.CNB
    : C extends '6'
    ? RegionType.US
    : C extends '7'
    ? RegionType.EU
    : C extends '8'
    ? RegionType.AS
    : C extends '9'
    ? RegionType.CHT
    : never
    : never

const RegionTypeMap = {
    1: RegionType.CN,
    2: RegionType.CN,
    5: RegionType.CNB,
    6: RegionType.US,
    7: RegionType.EU,
    8: RegionType.AS,
    9: RegionType.CHT
} as const

export const getRegionType = (uid: `${number}`): RegionType => RegionTypeMap[+uid[0]]
