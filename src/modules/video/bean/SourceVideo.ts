export interface VideoResponseData {
  code: number;
  msg: string;
  page: number;
  pagecount: number;
  limit: string; // 注意：limit 是一个字符串，即使它看起来像数字
  total: number;
  list: any[]; // 假设 list 是一个数组，包含任意类型的元素
}

export interface SourceVideo {
  group_id?: number;
  type_id?: number;
  type_id_1?: number;
  type_name?: string;
  vod_actor?: string;
  vod_area?: string;
  vod_author?: string;
  vod_behind?: string;
  vod_blurb?: string;
  vod_class?: string;
  vod_color?: string;
  vod_content?: string;
  vod_copyright?: number;
  vod_director?: string;
  vod_douban_id?: number;
  vod_douban_score?: string;
  vod_down?: number;
  vod_down_from?: string;
  vod_down_note?: string;
  vod_down_server?: string;
  vod_down_url?: string;
  vod_duration?: string;
  vod_en?: string;
  vod_hits?: number;
  vod_hits_day?: number;
  vod_hits_month?: number;
  vod_hits_week?: number;
  vod_id?: number;
  vod_isend?: number;
  vod_jumpurl?: string;
  vod_lang?: string;
  vod_letter?: string;
  vod_level?: number;
  vod_lock?: number;
  vod_name?: string;
  vod_pic?: string;
  vod_pic_screenshot?: string | null;
  vod_pic_slide?: string;
  vod_pic_thumb?: string;
  vod_play_from?: string;
  vod_play_note?: string;
  vod_play_server?: string;
  vod_play_url?: string;
  vod_plot?: number;
  vod_plot_detail?: string;
  vod_plot_name?: string;
  vod_points?: number;
  vod_points_down?: number;
  vod_points_play?: number;
  vod_pubdate?: string;
  vod_pwd?: string;
  vod_pwd_down?: string;
  vod_pwd_down_url?: string;
  vod_pwd_play?: string;
  vod_pwd_play_url?: string;
  vod_pwd_url?: string;
  vod_rel_art?: string;
  vod_rel_vod?: string;
  vod_remarks?: string;
  vod_reurl?: string;
  vod_score?: string;
  vod_score_all?: number;
  vod_score_num?: number;
  vod_serial?: string;
  vod_state?: string;
  vod_status?: number;
  vod_sub?: string;
  vod_tag?: string;
  vod_time?: string;
  vod_time_add?: number;
  vod_time_hits?: number;
  vod_time_make?: number;
  vod_total?: number;
  vod_tpl?: string;
  vod_tpl_down?: string;
  vod_tpl_play?: string;
  vod_trysee?: number;
  vod_tv?: string;
  vod_up?: number;
  vod_version?: string;
  vod_weekday?: string;
  vod_writer?: string;
  vod_year?: string;
}

export interface Line {
  name: string;
  file: string;
  sub_title: string;
  video_id: number;
  tag: string;
  sort: number;
  video_line_id: number;
  video_name: string;
  collection_id: number;
  collection_name: string;
}
