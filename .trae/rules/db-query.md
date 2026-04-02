---
description: 数据库查询操作(Database Query)
globs:
---
# 数据库查询操作(Database Query)

## 事务示例

`cool-admin`封装了自己事务，让代码更简洁

#### 示例

```ts
import { Inject, Provide } from "@midwayjs/core";
import { BaseService, CoolTransaction } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/orm";
import { Repository, QueryRunner } from "typeorm";
import { DemoAppGoodsEntity } from "../entity/goods";

/**
 * 商品
 */
@Provide()
export class DemoGoodsService extends BaseService {
  @InjectEntityModel(DemoAppGoodsEntity)
  demoAppGoodsEntity: Repository<DemoAppGoodsEntity>;

  /**
   * 事务
   * @param params
   * @param queryRunner 无需调用者传参, 自动注入，最后一个参数
   */
  @CoolTransaction({ isolation: "SERIALIZABLE" })
  async testTransaction(params: any, queryRunner?: QueryRunner) {
    await queryRunner.manager.insert<DemoAppGoodsEntity>(DemoAppGoodsEntity, {
      title: "这是个商品",
      pic: "商品图",
      price: 99.0,
      type: 1,
    });
  }
}
```

::: tip
`CoolTransaction`中已经做了异常捕获，所以方法内部无需捕获异常，必须使用`queryRunner`做数据库操作，
而且不能是异步的，否则事务无效，
`queryRunner`会注入到被注解的方法最后一个参数中, 无需调用者传参
:::

## 多表关联查询

cool-admin 有三种方式的联表查询：

### 1、controller 上配置

特别注意要配置 select, 不然会报重复字段错误

```ts
@CoolController({
  // 添加通用CRUD接口
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  // 设置表实体
  entity: DemoAppGoodsEntity,
  // 分页查询配置
  pageQueryOp: {
    // 指定返回字段，注意多表查询这个是必要的，否则会出现重复字段的问题
    select: ['a.*', 'b.name', 'a.name AS userName'],
    // 联表查询
    join: [
      {
        entity: BaseSysUserEntity,
        alias: 'b',
        condition: 'a.userId = b.id'
      },
    ]
})
```

### 2、service 中

通过`this.nativeQuery`或者`this.sqlRenderPage`两种方法执行自定义 sql

- nativeQuery：执行原生 sql，返回数组
- sqlRenderPage：执行原生 sql，返回分页对象

模板 sql 示例，方便动态传入参数，千万不要直接拼接 sql，有 sql 注入风险，以下方法 cool-admin 内部已经做了防注入处理

- setSql：第一个参数是条件，第二个参数是 sql，第三个参数是参数数组

```ts
this.nativeQuery(
      `SELECT
        a.*,
        b.nickName
      FROM
        demo_goods a
        LEFT JOIN user_info b ON a.userId = b.id
      ${this.setSql(true, 'and b.userId = ?', [userId])}`
```

### 3、通过 typeorm 原生的写法

示例

```ts
const find = this.demoGoodsEntity
  .createQueryBuilder("a")
  .select(["a.*", "b.nickName as userName"])
  .leftJoin(UserInfoEntity, "b", "a.id = b.id")
  .getRawMany();
```
