---
description: 控制器路由配置(Controller Route)
globs:
---
# 控制器路由配置(Controller Route)

为了实现`快速CRUD`与`自动路由`功能，框架基于[midwayjs controller](mdc:https:/www.midwayjs.org/docs/controller)，进行改造加强

完全继承[midwayjs controller](mdc:https:/www.midwayjs.org/docs/controller)的所有功能

`快速CRUD`与`自动路由`，大大提高编码效率与编码量

## 路由前缀

虽然可以手动设置，但是我们并不推荐，cool-admin 在全局权限校验包含一定的规则，

如果你没有很了解框架原理手动设置可能产生部分功能失效的问题

### 手动

`/api/other`

无通用 CRUD 设置方法

```ts
import { CoolController, BaseController } from "@cool-midway/core";

/**
 * 商品
 */
@CoolController("/api")
export class AppDemoGoodsController extends BaseController {
  /**
   * 其他接口
   */
  @Get("/other")
  async other() {
    return this.ok("hello, cool-admin!!!");
  }
}
```

含通用 CRUD 配置方法

```ts
import { Get } from "@midwayjs/core";
import { CoolController, BaseController } from "@cool-midway/core";
import { DemoGoodsEntity } from "../../entity/goods";

/**
 * 商品
 */
@CoolController({
  prefix: "/api",
  api: ["add", "delete", "update", "info", "list", "page"],
  entity: DemoGoodsEntity,
})
export class AppDemoGoodsController extends BaseController {
  /**
   * 其他接口
   */
  @Get("/other")
  async other() {
    return this.ok("hello, cool-admin!!!");
  }
}
```

### 自动

大多数情况下你无需指定自己的路由前缀，路由前缀将根据规则自动生成。

::: warning 警告
自动路由只影响模块中的 controller，其他位置建议不要使用
:::

`src/modules/demo/controller/app/goods.ts`

路由前缀是根据文件目录文件名按照[规则](mdc:src/guide/core/controller.html#规则)生成的，上述示例生成的路由为

`http://127.0.0.1:8001/app/demo/goods/xxx`

`xxx`代表具体的方法，如： `add`、`page`、`other`

```ts
import { Get } from "@midwayjs/core";
import { CoolController, BaseController } from "@cool-midway/core";
import { DemoGoodsEntity } from "../../entity/goods";

/**
 * 商品
 */
@CoolController({
  api: ["add", "delete", "update", "info", "list", "page"],
  entity: DemoGoodsEntity,
})
export class AppDemoGoodsController extends BaseController {
  /**
   * 其他接口
   */
  @Get("/other")
  async other() {
    return this.ok("hello, cool-admin!!!");
  }
}
```

### 规则

/controller 文件夹下的文件夹名或者文件名/模块文件夹名/方法名

#### 举例

```ts
 // 模块目录
 ├── modules
 │   └── demo(模块名)
 │   │    └── controller(api接口)
 │   │    │     └── app(参数校验)
 │   │    │     │     └── goods.ts(商品的controller)
 │   │    │     └── pay.ts(支付的controller)
 │   │    └── config.ts(必须，模块的配置)
 │   │    └── init.sql(可选，初始化该模块的sql)

```

生成的路由前缀为：
`/pay/demo/xxx(具体的方法)`与`/app/demo/goods/xxx(具体的方法)`
