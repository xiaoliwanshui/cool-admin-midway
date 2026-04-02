---
description: 控制器CRUD配置(Controller CRUD)
globs:
---
# 控制器CRUD配置(Controller CRUD)

## CRUD

### 参数配置(CurdOption)

通用增删改查配置参数

| 参数               | 类型     | 说明                                                          | 备注 |
| ------------------ | -------- | ------------------------------------------------------------- | ---- |
| prefix             | String   | 手动设置路由前缀                                              |      |
| api                | Array    | 快速 API 接口可选`add` `delete` `update` `info` `list` `page` |      |
| serviceApis        | Array    | 将 service 方法注册为 api，通过 post 请求，直接调用 service 方法 |      |
| pageQueryOp        | QueryOp  | 分页查询设置                                                  |      |
| listQueryOp        | QueryOp  | 列表查询设置                                                  |      |
| insertParam        | Function | 请求插入参数，如新增的时候需要插入当前登录用户的 ID           |      |
| infoIgnoreProperty | Array    | `info`接口忽略返回的参数，如用户信息不想返回密码              |      |

### 查询配置(QueryOp)

分页查询与列表查询配置参数

| 参数              | 类型     | 说明                                                                                | 备注 |
| ----------------- | -------- | ----------------------------------------------------------------------------------- | ---- |
| keyWordLikeFields | Array    | 支持模糊查询的字段，如一个表中的`name`字段需要模糊查询                              |      |
| where             | Function | 其他查询条件                                                                        |      |
| select            | Array    | 选择查询字段                                                                        |      |
| fieldEq           | Array    | 筛选字段，字符串数组或者对象数组{ column: string, requestParam: string }，如 type=1 |      |
| fieldLike         | Array    | 模糊查询字段，字符串数组或者对象数组{ column: string, requestParam: string }，如 title |      |
| addOrderBy        | Object   | 排序                                                                                |      |
| join              | JoinOp[] | 关联表查询                                                                          |      |

### 关联表(JoinOp)

关联表查询配置参数

| 参数      | 类型   | 说明                                                               |
| --------- | ------ | ------------------------------------------------------------------ |
| entity    | Class  | 实体类，注意不能写表名                                                  |
| alias     | String | 别名，如果有关联表默认主表的别名为`a`, 其他表一般按 b、c、d...设置 |
| condition | String | 关联条件                                                           |
| type      | String | 内关联： 'innerJoin', 左关联：'leftJoin'                           |

### 完整示例

```ts
import { Get } from "@midwayjs/core";
import { CoolController, BaseController } from "@cool-midway/core";
import { BaseSysUserEntity } from "../../../base/entity/sys/user";
import { DemoAppGoodsEntity } from "../../entity/goods";

/**
 * 商品
 */
@CoolController({
  // 添加通用CRUD接口
  api: ["add", "delete", "update", "info", "list", "page"],
  // 8.x新增，将service方法注册为api，通过post请求，直接调用service方法
  serviceApis: [
    'use',
    {
      method: 'test1',
      summary: '不使用多租户', // 接口描述
    },
    'test2', // 也可以不设置summary
  ]
  // 设置表实体
  entity: DemoAppGoodsEntity,
  // 向表插入当前登录用户ID
  insertParam: (ctx) => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      userId: ctx.admin.userId,
    };
  },
  // 操作crud之前做的事情 @cool-midway/core@3.2.14 新增
  before: (ctx) => {
    // 将前端的数据转JSON格式存数据库
    const { data } = ctx.request.body;
    ctx.request.body.data = JSON.stringify(data);
  },
  // info接口忽略价格字段
  infoIgnoreProperty: ["price"],
  // 分页查询配置
  pageQueryOp: {
    // 让title字段支持模糊查询
    keyWordLikeFields: ["title"],
    // 让type字段支持筛选，请求筛选字段与表字段一致是情况
    fieldEq: ["type"],
    // 多表关联，请求筛选字段与表字段不一致的情况
    fieldEq: [{ column: "a.id", requestParam: "id" }],
     // 让title字段支持模糊查询，请求参数为title
    fieldLike: ['a.title'],
    // 让title字段支持模糊查询，请求筛选字段与表字段不一致的情况
    fieldLike: [{ column: "a.title", requestParam: "title" }],
    // 指定返回字段，注意多表查询这个是必要的，否则会出现重复字段的问题
    select: ["a.*", "b.name", "a.name AS userName"],
    // 4.x置为过时 改用 join 关联表用户表
    leftJoin: [
      {
        entity: BaseSysUserEntity,
        alias: "b",
        condition: "a.userId = b.id",
      },
    ],
    // 4.x新增
    join: [
      {
        entity: BaseSysUserEntity,
        alias: "b",
        condition: "a.userId = b.id",
        type: "innerJoin",
      },
    ],
    // 4.x 新增 追加其他条件
    extend: async (find: SelectQueryBuilder<DemoGoodsEntity>) => {
      find.groupBy("a.id");
    },
    // 增加其他条件
    where: async (ctx) => {
      // 获取body参数
      const { a } = ctx.request.body;
      return [
        // 价格大于90
        ["a.price > :price", { price: 90.0 }],
        // 满足条件才会执行
        ["a.price > :price", { price: 90.0 }, "条件"],
        // 多个条件一起
        [
          "(a.price = :price or a.userId = :userId)",
          { price: 90.0, userId: ctx.admin.userId },
        ],
      ];
    },
    // 添加排序
    addOrderBy: {
      price: "desc",
    },
  },
})
export class DemoAppGoodsController extends BaseController {
  /**
   * 其他接口
   */
  @Get("/other")
  async other() {
    return this.ok("hello, cool-admin!!!");
  }
}
```

::: warning
如果是多表查询，必须设置 select 参数，否则会出现重复字段的错误，因为每个表都继承了 BaseEntity，至少都有 id、createTime、updateTime 三个相同的字段。
:::

通过这一波操作之后，我们的商品接口的功能已经很强大了，除了通用的 CRUD，我们的接口还支持多种方式的数据筛选

### 获得 ctx 对象

```ts
@CoolController(
  {
    api: ['add', 'delete', 'update', 'info', 'list', 'page'],
    entity: DemoAppGoodsEntity,
    // 获得ctx对象
    listQueryOp: ctx => {
      return new Promise<QueryOp>(res => {
        res({
          fieldEq: [],
        });
      });
    },
    // 获得ctx对象
    pageQueryOp: ctx => {
      return new Promise<QueryOp>(res => {
        res({
          fieldEq: [],
        });
      });
    },
  },
  {
    middleware: [],
  }
)
```

### 接口调用

`add` `delete` `update` `info` 等接口可以用法[参照快速开始](mdc:src/guide/quick.html#接口调用)

这里详细说明下`page` `list`两个接口的调用方式，这两个接口调用方式差不多，一个是分页一个是非分页。
以`page`接口为例

#### 分页

POST `/admin/demo/goods/page` 分页数据

**请求**
Url: http://127.0.0.1:8001/admin/demo/goods/page

Method: POST

#### Body

```json
{
  "keyWord": "商品标题", // 模糊搜索，搜索的字段对应keyWordLikeFields
  "type": 1, // 全等于筛选，对应fieldEq
  "page": 2, // 第几页
  "size": 1, // 每页返回个数
  "sort": "desc", // 排序方向
  "order": "id" // 排序字段
}
```

**返回**

```json
{
  "code": 1000,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 4,
        "createTime": "2021-03-12 16:23:46",
        "updateTime": "2021-03-12 16:23:46",
        "title": "这是一个商品2",
        "pic": "https://show.cool-admin.com/uploads/20210311/2e393000-8226-11eb-abcf-fd7ae6caeb70.png",
        "price": "99.00",
        "userId": 1,
        "type": 1,
        "name": "超级管理员"
      }
    ],
    "pagination": {
      "page": 2,
      "size": 1,
      "total": 4
    }
  }
}
```
