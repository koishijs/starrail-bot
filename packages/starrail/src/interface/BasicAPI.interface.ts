import { Region } from "../utils/Region"

export type APIRequestMethod = 'GET' | 'POST'
export type APIType = keyof APIRegionOption

export type APIStencil = {
    readonly [K in string]: APIStencilOption
}

export type APIRegion = {
    readonly [K in Region]: APIRegionOption
}

export interface APIStencilOption {
    availableFor: Region[]
    hostBy?: APIType | Record<Region, APIType | undefined>
    method: APIRequestMethod
    url: string | Record<Region, string>
    cookie: boolean
}

export interface APIRegionOption {
    readonly takumi: string
    readonly hk4e: string
    readonly record: string
}
