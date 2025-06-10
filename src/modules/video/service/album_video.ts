import { Provide} from "@midwayjs/core";
import {InjectEntityModel} from "@midwayjs/typeorm";
import {VideoEntity} from "../entity/videos";
import {In, Repository} from "typeorm";
import { VideoAlbumRelationship} from "../entity/video_album_relationship";

const TAG = 'AlbumVideoServer';

@Provide()
export class AlbumVideoServer {
  @InjectEntityModel(VideoEntity)
  videoEntity: Repository<VideoEntity>;

  @InjectEntityModel(VideoAlbumRelationship)
  videoAlbumRelationship: Repository<VideoAlbumRelationship>;

  //批量添加专辑内容
  async insertAlbumVideo(id:number,title:[string]): Promise<any> {
    const list= await this.videoEntity.findBy({ title: In(title) });
    return await this.videoAlbumRelationship.save(
      list.map((item) => {
        return {
          album_id: id,
          videos_id: item.id,
        };
      })
    );
  }
}
