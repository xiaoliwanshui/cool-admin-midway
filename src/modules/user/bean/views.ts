export interface ViewsEntityBean {
  title?: string; // 标题，可选
  type: number; // 分类
  associationId: number; // 关联id
  duration: number; // 视频时长
  viewingDuration: number; // 观看时长
  videoIndex: number; // 当前观看索引
  cover?: string; // 封面，可选
}
