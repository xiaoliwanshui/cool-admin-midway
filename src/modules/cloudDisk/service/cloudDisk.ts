import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { AlbumEntity } from '../entity/album';
import { CloudDiskEntity } from '../entity/cloudDisk';
import { AlbumCloudDiskEntity } from '../entity/album_cloudDisk';

/**
 * 云盘
 */
export class CloudDiskService extends BaseService {
  @InjectEntityModel(CloudDiskEntity)
  cloudDiskEntity: Repository<CloudDiskEntity>;

  @InjectEntityModel(AlbumEntity)
  albumEntity: Repository<AlbumEntity>;

  @InjectEntityModel(AlbumCloudDiskEntity)
  albumCloudDiskEntity: Repository<AlbumCloudDiskEntity>;

  async tagSelect({
    types,
    page,
    size,
  }: {
    types: string;
    page?: number;
    size?: number;
  }) {
    page = page ? page : 1;
    size = size ? size : 5;
    let data: any = {};
    let total = 0;
    try {
      data = await this.cloudDiskEntity.query(
        `SELECT * FROM wallpaper WHERE JSON_CONTAINS(types, '${types}') LIMIT ${
          page - 1
        },${size}`
      );
      total = await this.cloudDiskEntity.query(
        `SELECT COUNT(*) AS 'total' FROM wallpaper WHERE JSON_CONTAINS(types, '${types}')`
      );
    } catch (e) {
      console.log(e);
      data = e;
    }
    return {
      list: data,
      pagination: { total: parseInt(total[0].total), page, size },
    };
  }

  async find(ids: Array<number>) {
    let list = await this.cloudDiskEntity.findBy({ id: In(ids) });
    return { list };
  }

  /**
   * 排序查询
   */
  async sort(query: any): Promise<any> {
    const find = this.albumCloudDiskEntity.createQueryBuilder();
    const { sort, category_pid } = query;
    delete query.sort;
    find.where(category_pid ? { category_pid } : {}).orderBy(sort, 'DESC');
    return this.entityRenderPage(find, query);
  }

  async page(query: any): Promise<any> {
    let { list } = await this.wallpaperAlbumEntityPage(query);
    return await this.wallpaperAlbumRelationshipPage(list);
  }

  /**
   * 执行entity分页
   */
  async wallpaperAlbumEntityPage(query: any): Promise<any> {
    const find = this.albumEntity.createQueryBuilder();
    find.where('type= :type', query).orderBy('sort', 'ASC');
    return this.entityRenderPage(find, query);
  }

  async wallpaperAlbumRelationshipPage(query: any): Promise<any> {
    for (const item of query) {
      let wallpaper = [];
      let data = await this.albumCloudDiskEntity.find({
        where: { albumId: item.id },
        take: 4,
      });
      for (const dataItem of data) {
        wallpaper.push(
          await this.cloudDiskEntity.findOneBy({
            id: dataItem.cloudDiskId,
          })
        );
      }
      item['list'] = wallpaper;
    }
    return { list: query };
  }
}
