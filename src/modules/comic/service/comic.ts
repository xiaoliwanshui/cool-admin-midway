import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { AlbumEntity } from '../entity/album';
import { ComicEntity } from '../entity/comic';
import { AlbumComicEntity } from '../entity/album_comic';

export class ComicService extends BaseService {
  @InjectEntityModel(ComicEntity)
  ComicEntity: Repository<ComicEntity>;

  @InjectEntityModel(AlbumEntity)
  albumEntity: Repository<AlbumEntity>;

  @InjectEntityModel(AlbumComicEntity)
  albumComicEntity: Repository<AlbumComicEntity>;

  async find(ids: Array<number>) {
    let list = await this.ComicEntity.findBy({
      id: In(ids),
    });
    return { list };
  }

  /**
   * 排序查询
   */
  async sort(query: any): Promise<any> {
    const find = this.albumComicEntity.createQueryBuilder();
    const { sort, type } = query;
    delete query.sort;
    find.where(type ? { type } : {}).orderBy(sort, 'DESC');
    return this.entityRenderPage(find, query);
  }

  async page(query: any): Promise<any> {
    let { list } = await this.comicAlbumEntityPage(query);
    return await this.comicAlbumRelationshipPage(list);
  }

  /**
   * 执行entity分页
   */
  async comicAlbumEntityPage(query: any): Promise<any> {
    const find = this.albumEntity.createQueryBuilder();
    find.where('type= :type', query).orderBy('sort', 'ASC');
    return this.entityRenderPage(find, query);
  }

  async comicAlbumRelationshipPage(query: any): Promise<any> {
    for (const item of query) {
      let comic = [];
      let data = await this.albumComicEntity.find({
        where: { albumId: item.id },
        take: 6,
      });
      for (const dataItem of data) {
        comic.push(
          await this.ComicEntity.findOneBy({
            id: dataItem.comicId,
          })
        );
      }
      item['list'] = comic;
    }
    return { list: query };
  }
}
