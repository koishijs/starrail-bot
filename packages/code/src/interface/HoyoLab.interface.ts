interface HoyoLab {
    is_last: boolean,
    next_offset: number,
    list: HoyoLabPostList[]
}

interface HoyoLabPostList {
    id: string;
    uid: string;
    entity_id: string;
    entity_type: number;
    publish_at: string;
    game_id: string;
    post: HoyoLabPost;
}

interface HoyoLabPoster {
    game_id: number;
    post_id: string;
    f_forum_id: number;
    uid: string;
    subject: string;
    content: string;
    cover: string;
    view_type: number;
    created_at: number;
    images: string[];
    post_status: HoyoLabPost_statu;
    topic_ids: number[];
    view_status: number;
    max_floor: number;
    is_original: number;
    republish_authorization: number;
    reply_time: string;
    is_deleted: number;
    is_interactive: boolean;
    structured_content: string;
    structured_content_rows: any[];
    review_id: number;
    is_profit: boolean;
    is_in_profit: boolean;
    summary: string;
    is_missing: boolean;
    pre_pub_status: number;
    profit_post_status: number;
    is_showing_missing: boolean;
    block_reply_img: number;
}

interface HoyoLabPost_statu {
    is_top: boolean;
    is_good: boolean;
    is_official: boolean;
}

interface HoyoLabForum {
    id: number;
    name: string;
    icon: string;
    game_id: number;
}

interface HoyoLabTopic {
    id: number;
    name: string;
    cover: string;
    is_top: boolean;
    is_good: boolean;
    is_interactive: boolean;
    game_id: number;
    content_type: number;
}

interface HoyoLabCertification {
    type: number;
    label: string;
}

interface HoyoLabLevel_exp {
    level: number;
    exp: number;
}

interface HoyoLabUser {
    uid: string;
    nickname: string;
    introduce: string;
    avatar: string;
    gender: number;
    certification: HoyoLabCertification;
    level_exp: HoyoLabLevel_exp;
    is_following: boolean;
    is_followed: boolean;
    avatar_url: string;
    pendant: string;
}

interface HoyoLabSelf_operation {
    attitude: number;
    is_collected: boolean;
}

interface HoyoLabStat {
    view_num: number;
    reply_num: number;
    like_num: number;
    bookmark_num: number;
    forward_num: number;
}

interface HoyoLabCrop {
    x: number;
    y: number;
    w: number;
    h: number;
    url: string;
}

interface HoyoLabCover {
    url: string;
    height: number;
    width: number;
    format: string;
    size: string;
    crop: HoyoLabCrop;
    is_user_set_cover: boolean;
    image_id: string;
    entity_type: string;
    entity_id: string;
}

interface HoyoLabImage_list {
    url: string;
    height: number;
    width: number;
    format: string;
    size: string;
    crop?: any;
    is_user_set_cover: boolean;
    image_id: string;
    entity_type: string;
    entity_id: string;
}

interface HoyoLabPost {
    post: HoyoLabPoster;
    forum: HoyoLabForum;
    topics: HoyoLabTopic[];
    user: HoyoLabUser;
    self_operation: HoyoLabSelf_operation;
    stat: HoyoLabStat;
    help_sys?: any;
    cover: HoyoLabCover;
    image_list: HoyoLabImage_list[];
    is_official_master: boolean;
    is_user_master: boolean;
    hot_reply_exist: boolean;
    vote_count: number;
    last_modify_time: number;
    recommend_type: string;
    collection?: any;
    vod_list: any[];
    is_block_on: boolean;
    forum_rank_info?: any;
}

