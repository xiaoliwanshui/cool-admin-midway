import { CollectionType } from './CollectionType';

export interface SyncBody {
  id: number; // 假设 id 是字符串类型
  type: CollectionType;
}
