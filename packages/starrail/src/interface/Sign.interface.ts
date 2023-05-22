export interface Sign {
    month: number
    awards: SignHomeAward[]
}

export interface SignHome {
    month: number
    awards: SignHomeAward[]
}

export interface SignHomeAward {
    icon: string
    name: string
    cnt: number
}

export interface SignInfo {
    total_sign_day: number,
    today: string,
    is_sign: boolean,
    first_bind: boolean,
    is_sub: boolean,
    month_first: boolean,
    sign_cnt_missed: number,
    month_last_day: boolean
}