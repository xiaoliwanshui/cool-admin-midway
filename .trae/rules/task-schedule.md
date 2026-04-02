---
description: 定时任务(Task Schedule)
globs:
---
# 定时任务(Task Schedule)

## 内置任务（代码中配置）

内置定时任务能力来自于[midwayjs](https://www.midwayjs.org/docs/extensions/cron)

### 引入组件

```ts
import { Configuration } from "@midwayjs/core";
import * as cron from "@midwayjs/cron"; // 导入模块
import { join } from "path";

@Configuration({
  imports: [cron],
  importConfigs: [join(__dirname, "config")],
})
export class AutoConfiguration {}
```

### 使用

```ts
import { Job, IJob } from "@midwayjs/cron";
import { FORMAT } from "@midwayjs/core";

@Job({
  cronTime: FORMAT.CRONTAB.EVERY_PER_30_MINUTE,
  start: true,
})
export class DataSyncCheckerJob implements IJob {
  async onTick() {
    // ...
  }
}
```

```ts
@Job("syncJob", {
  cronTime: "*/2 * * * * *", // 每隔 2s 执行
})
export class DataSyncCheckerJob implements IJob {
  async onTick() {
    // ...
  }
}
```

### 规则 cron

```ts
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)

```

::: warning 警告

注意：该方式在多实例部署的情况下无法做到任务之前的协同，任务存在重复执行的可能

:::

## 本地任务（管理后台配置，v8.0 新增）

可以到登录后台`/系统管理/任务管理/任务列表`，配置任务。默认是不需要任何依赖的， 旧版需要依赖`redis`才能使用该功能。

### 配置任务

配置完任务可以调用你配置的 service 方法，如：taskDemoService.test()

### 规则 cron

规则 cron

```ts
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)

```

规则示例：

- 每 5 秒执行一次: `*/5 * * * * *`
- 每 5 分钟执行一次: `*/5 * * * *`
- 每小时执行一次: `0 * * * *`
- 每天执行一次: `0 0 * * *`
- 每天 1 点执行: `0 1 * * *`
- 每周执行一次: `0 0 * * 0`
- 每月执行一次: `0 0 1 * *`

![](/admin/node/task.png)

## 分布式任务（管理后台配置）

当需要分布式部署时，需要开启分布式任务，通过 redis 作为协同整个集群的任务，防止任务重复执行等异常情况。

#### 引入插件

`src/configuration.ts`

```ts
import { Configuration, App } from "@midwayjs/core";
import { join } from "path";
import * as task from "@cool-midway/task";

@Configuration({
  imports: [task],
  importConfigs: [join(__dirname, "./config")],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady() {}
}
```

#### 配置

[redis>=5.x](https://redis.io/)，推荐[redis>=7.x](https://redis.io/)

`src/config/config.default.ts`

::: warning 注意
很多人忽略了这个配置，导致项目包 redis 连接错误！！！
:::

```ts
import { CoolFileConfig, MODETYPE } from "@cool-midway/file";
import { MidwayConfig } from "@midwayjs/core";
import * as fsStore from "cache-manager-fs-hash";

export default {
  // 修改成你自己独有的key
  keys: "cool-admin for node",
  koa: {
    port: 8001,
  },
  // cool配置
  cool: {
    redis: {
      host: "127.0.0.1",
      port: 6379,
      password: "",
      db: 0,
    },
  },
} as unknown as MidwayConfig;
```

redis cluster 方式

```ts
[
  {
    host: "192.168.0.103",
    port: 7000,
  },
  {
    host: "192.168.0.103",
    port: 7001,
  },
  {
    host: "192.168.0.103",
    port: 7002,
  },
  {
    host: "192.168.0.103",
    port: 7003,
  },
  {
    host: "192.168.0.103",
    port: 7004,
  },
  {
    host: "192.168.0.103",
    port: 7005,
  },
];
```

### 创建执行任务的 service

```ts
import { Provide } from "@midwayjs/core";
import { BaseService } from "@cool-midway/core";
/**
 * 任务执行的demo示例
 */
@Provide()
export class DemoTaskService extends BaseService {
  /**
   * 测试任务执行
   * @param params 接收的参数 数组 [] 可不传
   */
  async test(params?: []) {
    // 需要登录后台任务管理配置任务
    console.log("任务执行了", params);
  }
}
```

### 配置定时任务

登录后台 任务管理/任务列表

![](/admin/node/task.png)

::: warning
截图中的 demoTaskService 为上一步执行任务的 service 的实例 ID，midwayjs 默认为类名首字母小写！！！

任务调度基于 redis，所有的任务都需要通过代码去维护任务的创建，启动，暂停。 所以直接改变数据库的任务状态是无效的，redis 中的信息还未清空， 任务将继续执行。
:::
