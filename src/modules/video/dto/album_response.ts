import { VideoEntity } from '../entity/videos';
import { VideoAlbumEntity } from '../entity/album';

/**
 * 专辑视频信息
 */
export interface AlbumVideoInfo extends VideoAlbumEntity {
  list?: VideoEntity[];
}

/**
 * 专辑查询响应
 */
export interface AlbumResponse {
  list: AlbumVideoInfo[];
  pagination: {
    page: number;
    size: number;
    videoSize: number;
    videoPage: number;
  };
}