export const tagSQLQuery: string = `SELECT DISTINCT
  TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(cleaned_tags, ',', n), ',', -1)) AS tag
FROM (
  SELECT
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(video_tag, ' ', ','),  -- 1. 空格转逗号
            '·', ','                      -- 2. 间隔号转逗号
          ),
          '；', ','                       -- 3. 中文分号转逗号
        ),
        ',,', ','                       -- 4. 清理连续逗号
      ),
      ', ', ','                         -- 5. 清理逗号+空格组合
    ) AS cleaned_tags
  FROM video
) AS v
JOIN (
  SELECT 1 AS n UNION ALL
  SELECT 2 UNION ALL
  SELECT 3 UNION ALL
  SELECT 4  -- 根据实际最大标签数量扩展
) numbers
ON CHAR_LENGTH(cleaned_tags) - CHAR_LENGTH(REPLACE(cleaned_tags, ',', '')) >= n - 1
WHERE
  TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(cleaned_tags, ',', n), ',', -1)) != ''
  AND TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(cleaned_tags, ',', n), ',', -1)) REGEXP '^[一-龥]+$'
  -- 新增：过滤包含中文数字的标签
  AND TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(cleaned_tags, ',', n), ',', -1)) NOT REGEXP '[一二三四五六七八九十]';`;
