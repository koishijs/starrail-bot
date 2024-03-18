export interface MiyouLiveIndex {
  is_login: boolean
  live: Live
  streamer: Streamer
  template: string
  game: string
  play_list: any[]
  match: Match
  live_list: LiveList
}

export interface Live {
  act_type: string
  title: string
  live_time: string
  start: string
  end: string
  remain: number
  now: string
  is_end: boolean
  code_ver: string
}

export interface Streamer {
  aid: string
  nickname: string
  avatar: string
  fans: number
  cert_label: string
  cert_type: string
  followed: boolean
}

export interface Match {
  title: string
  match_id: string
  template: string
  stage: any
  subscribe_all: boolean
  type: string
  result_type: string
}

export interface LiveList {
  total: number
  list: any[]
  title: string
  page_token: string
  list_id: string
}

export interface MiyouLiveCode {
  code_list: CodeList[]
}

export interface CodeList {
  title: string
  code: string
  img: string
  to_get_time: string
}
