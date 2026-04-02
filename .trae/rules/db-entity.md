---
description: 数据库实体与字段(Database Entity)
globs:
---
# 数据库实体与字段(Database Entity)

## 字段

BaseEntity 是实体基类，所有实体类都需要继承它。

- v8.x 之前位于`@cool-midway/core`包中
- v8.x 之后位于`src/modules/base/entity/base.ts`

```typescript
import { Index, PrimaryGeneratedColumn, Column } from "typeorm";
import * as moment from "moment";
import { CoolBaseEntity } from "@cool-midway/core";

const transformer = {
  to(value) {
    return value
      ? moment(value).format("YYYY-MM-DD HH:mm:ss")
      : moment().format("YYYY-MM-DD HH:mm:ss");
  },
  from(value) {
    return value;
  },
};

/**
 * 实体基类
 */
export abstract class BaseEntity extends CoolBaseEntity {
  // 默认自增
  @PrimaryGeneratedColumn("increment", {
    comment: "ID",
  })
  id: number;

  @Index()
  @Column({
    comment: "创建时间",
    type: "varchar",
    transformer,
  })
  createTime: Date;

  @Index()
  @Column({
    comment: "更新时间",
    type: "varchar",
    transformer,
  })
  updateTime: Date;

  @Index()
  @Column({ comment: "租户ID", nullable: true })
  tenantId: number;
}
```

```typescript
// v8.x 之前
import { BaseEntity } from "@cool-midway/core";
// v8.x 之后
import { BaseEntity } from "../../base/entity/base";
import { Column, Entity, Index } from "typeorm";

/**
 * demo模块-用户信息
 */
// 表名必须包含模块固定格式：模块_，
@Entity("demo_user_info")
// DemoUserInfoEntity是模块+表名+Entity
export class DemoUserInfoEntity extends BaseEntity {
  @Index()
  @Column({ comment: "手机号", length: 11 })
  phone: string;

  @Index({ unique: true })
  @Column({ comment: "身份证", length: 50 })
  idCard: string;

  // 生日只需要精确到哪一天，所以type:'date'，如果需要精确到时分秒,应为'datetime'
  @Column({ comment: "生日", type: "date" })
  birthday: Date;

  @Column({ comment: "状态 0-禁用 1-启用", default: 1 })
  status: number;

  @Column({
    comment: "分类 0-普通 1-会员 2-超级会员",
    default: 0,
    type: "tinyint",
  })
  type: number;

  // 由于labels的类型是一个数组，所以Column中的type类型必须得是'json'
  @Column({ comment: "标签", nullable: true, type: "json" })
  labels: string[];

  @Column({
    comment: "余额",
    type: "decimal",
    precision: 5,
    scale: 2,
  })
  balance: number;

  @Column({ comment: "备注", nullable: true })
  remark: string;

  @Column({ comment: "简介", type: "text", nullable: true })
  summary: string;
}
```

## 虚拟字段

虚拟字段是指数据库中没有实际存储的字段，而是通过其他字段计算得到的字段，这种字段在查询时可以直接使用，但是不能进行更新操作

```ts
import { BaseEntity } from "@cool-midway/core";
import { Column, Entity, Index } from "typeorm";

/**
 * 数据实体
 */
@Entity("xxx_xxx")
export class XxxEntity extends BaseEntity {
  @Index()
  @Column({
    type: "varchar",
    length: 7,
    asExpression: "DATE_FORMAT(createTime, '%Y-%m')",
    generatedType: "VIRTUAL",
    comment: "月份",
  })
  month: string;

  @Index()
  @Column({
    type: "varchar",
    length: 4,
    asExpression: "DATE_FORMAT(createTime, '%Y')",
    generatedType: "VIRTUAL",
    comment: "年份",
  })
  year: string;

  @Index()
  @Column({
    type: "varchar",
    length: 10,
    asExpression: "DATE_FORMAT(createTime, '%Y-%m-%d')",
    generatedType: "VIRTUAL",
    comment: "日期",
  })
  date: string;

  @Column({ comment: "退款", type: "json", nullable: true })
  refund: {
    // 退款单号
    orderNum: string;
    // 金额
    amount: number;
    // 实际退款金额
    realAmount: number;
    // 状态 0-申请中 1-已退款 2-拒绝
    status: number;
    // 申请时间
    applyTime: Date;
    // 退款时间
    time: Date;
    // 退款原因
    reason: string;
    // 拒绝原因
    refuseReason: string;
  };

  // 将退款状态提取出来，方便查询
  @Index()
  @Column({
    asExpression: "JSON_EXTRACT(refund, '$.status')",
    generatedType: "VIRTUAL",
    comment: "退款状态",
    nullable: true,
  })
  refundStatus: number;
}
```

## 不使用外键

typeorm 有很多 OneToMany, ManyToOne, ManyToMany 等关联关系，这种都会生成外键，但是在实际生产开发中，不推荐使用外键：

- 性能影响：外键会在插入、更新或删除操作时增加额外的开销。数据库需要检查外键约束是否满足，这可能会降低数据库的性能，特别是在大规模数据操作时更为明显。

- 复杂性增加：随着系统的发展，数据库结构可能会变得越来越复杂。外键约束增加了数据库结构的复杂性，使得数据库的维护和理解变得更加困难。

- 可扩展性问题：在分布式数据库系统中，数据可能分布在不同的服务器上。外键约束会影响数据的分片和分布，限制了数据库的可扩展性。

- 迁移和备份困难：带有外键约束的数据库迁移或备份可能会变得更加复杂。迁移时需要保证数据的完整性和约束的一致性，这可能会增加迁移的难度和时间。

- 业务逻辑耦合：过多依赖数据库的外键约束可能会导致业务逻辑过度耦合于数据库层。这可能会限制应用程序的灵活性和后期的业务逻辑调整。

- 并发操作问题：在高并发的场景下，外键约束可能会导致锁的竞争，增加死锁的风险，影响系统的稳定性和响应速度。

尽管外键提供了数据完整性保障，但在某些场景下，特别是在高性能和高可扩展性要求的系统中，可能会选择在应用层实现相应的完整性检查和约束逻辑，以避免上述问题。这需要在设计系统时根据实际需求和环境来权衡利弊，做出合适的决策。

## 配置字典和可选项（8.x 新增）

为了让前端可能自动识别某个字段的可选项或者属于哪个字典，我们可以在@Column 注解上配置`options`和`dict`属性，

旧的写法

```ts
// 无法指定字典

// 可选项只能按照一定规则编写，否则前端无法识别
@Column({ comment: '状态 0-禁用 1-启用', default: 1 })
status: number;
```

新的写法

```ts
// 指定字典为goodsType，这样前端生成的时候就会默认指定这个字典
@Column({ comment: '分类', dict: 'goodsType' })
type: number;

// 状态的可选项有禁用和启用，默认是启用，值是数组的下标，0-禁用，1-启用
@Column({ comment: '状态', dict: ['禁用', '启用'], default: 1 })
status: number;
```
