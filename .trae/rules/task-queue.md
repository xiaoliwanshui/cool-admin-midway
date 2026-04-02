---
description: 队列(Task Queue)
globs:
---
# 队列(Task Queue)

之前的分布式任务调度，其实是利用了[bullmq](https://docs.bullmq.io/)的重复队列机制。

在项目开发过程中特别是较大型、数据量较大、业务较复杂的场景下往往需要用到队列。 如：抢购、批量发送消息、分布式事务、订单 2 小时后失效等。

得益于[bullmq](https://docs.bullmq.io/)，cool 的队列也支持`延迟`、`重复`、`优先级`等高级特性。

## 创建队列

一般放在名称为 queue 文件夹下

### 普通队列

普通队列数据由消费者自动消费，必须重写 data 方法用于被动消费数据。

`src/modules/demo/queue/comm.ts`

```ts
import { BaseCoolQueue, CoolQueue } from "@cool-midway/task";
import { IMidwayApplication } from "@midwayjs/core";
import { App } from "@midwayjs/core";

/**
 * 普通队列
 */
@CoolQueue()
export class DemoCommQueue extends BaseCoolQueue {
  @App()
  app: IMidwayApplication;

  async data(job: any, done: any): Promise<void> {
    // 这边可以执行定时任务具体的业务或队列的业务
    console.log("数据", job.data);
    // 抛出错误 可以让队列重试，默认重试5次
    //throw new Error('错误');
    done();
  }
}
```

### 主动队列

主动队列数据由消费者主动消费

`src/modules/demo/queue/getter.ts`

```ts
import { BaseCoolQueue, CoolQueue } from "@cool-midway/task";

/**
 * 主动消费队列
 */
@CoolQueue({ type: "getter" })
export class DemoGetterQueue extends BaseCoolQueue {}
```

主动消费数据

```ts
 // 主动消费队列
  @Inject()
  demoGetterQueue: DemoGetterQueue;

  const job = await this.demoGetterQueue.getters.getJobs(['wait'], 0, 0, true);
  // 获得完将数据从队列移除
  await job[0].remove();
```

## 发送数据

```ts
import { Get, Inject, Post, Provide } from "@midwayjs/core";
import { CoolController, BaseController } from "@cool-midway/core";
import { DemoCommQueue } from "../../queue/comm";
import { DemoGetterQueue } from "../../queue/getter";

/**
 * 队列
 */
@Provide()
@CoolController()
export class DemoQueueController extends BaseController {
  // 普通队列
  @Inject()
  demoCommQueue: DemoCommQueue;

  // 主动消费队列
  @Inject()
  demoGetterQueue: DemoGetterQueue;

  /**
   * 发送数据到队列
   */
  @Post("/add", { summary: "发送队列数据" })
  async queue() {
    this.demoCommQueue.add({ a: 2 });
    return this.ok();
  }

  /**
   * 获得队列中的数据，只有当队列类型为getter时有效
   */
  @Get("/getter")
  async getter() {
    const job = await this.demoCommQueue.getters.getJobs(["wait"], 0, 0, true);
    // 获得完将数据从队列移除
    await job[0].remove();
    return this.ok(job[0].data);
  }
}
```

## 队列配置

```ts
interface JobOpts {
  priority: number; // Optional priority value. ranges from 1 (highest priority) to MAX_INT  (lowest priority). Note that
  // using priorities has a slight impact on performance, so do not use it if not required.

  delay: number; // An amount of milliseconds to wait until this job can be processed. Note that for accurate delays, both
  // server and clients should have their clocks synchronized. [optional].

  attempts: number; // The total number of attempts to try the job until it completes.

  repeat: RepeatOpts; // Repeat job according to a cron specification.

  backoff: number | BackoffOpts; // Backoff setting for automatic retries if the job fails, default strategy: `fixed`

  lifo: boolean; // if true, adds the job to the right of the queue instead of the left (default false)
  timeout: number; // The number of milliseconds after which the job should be fail with a timeout error [optional]

  jobId: number | string; // Override the job ID - by default, the job ID is a unique
  // integer, but you can use this setting to override it.
  // If you use this option, it is up to you to ensure the
  // jobId is unique. If you attempt to add a job with an id that
  // already exists, it will not be added.

  removeOnComplete: boolean | number; // If true, removes the job when it successfully
  // completes. A number specified the amount of jobs to keep. Default behavior is to keep the job in the completed set.

  removeOnFail: boolean | number; // If true, removes the job when it fails after all attempts. A number specified the amount of jobs to keep
  // Default behavior is to keep the job in the failed set.
  stackTraceLimit: number; // Limits the amount of stack trace lines that will be recorded in the stacktrace.
}
```

::: tip
this.demoQueue.queue 获得的就是 bull 实例，更多 bull 的高级用户可以查看[bull 文档](https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md)
:::
