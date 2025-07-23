/**
 * @Author: 17691002584 17691002584@163.com
 * @Date: 2025-07-23 18:40:16
 * @LastEditors: 17691002584 17691002584@163.com
 * @LastEditTime: 2025-07-23 19:48:24
 * @FilePath: src/modules/user/entity/contacts.ts
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */

import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 用户手机联系人
 */
@Entity('user_contact')
export class ContactEntity extends BaseEntity {
  @Column({ comment: '联系人姓名', nullable: true, length: 50 })
  name: string;

  @Column({ comment: '手机号', nullable: true, unique: true })
  phone: string;
}
