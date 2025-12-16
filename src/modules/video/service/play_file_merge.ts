/**
 * @Author: 17691002584 17691002584@163.com
 * @Date: 2025-12-16 20:50:41
 * @LastEditors: 17691002584 17691002584@163.com
 * @LastEditTime: 2025-12-16 20:59:55
 * @FilePath: src/modules/video/service/play_file_merge.ts
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */
export const playFileMergeSQL: string = `
-- MySQL 8.0+ 删除语句（转换时间格式）
DELETE FROM video_play_line
WHERE id NOT IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY video_line_id, collection_id, video_id, sort
        ORDER BY STR_TO_DATE(updateTime, '%Y-%m-%d %H:%i:%s') DESC
      ) AS rn
    FROM video_play_line
  ) t
  WHERE rn = 1
);
`
