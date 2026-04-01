---
name: "task"
description: "Handles task scheduling and queues for cool-admin projects. Invoke when user needs to create scheduled tasks, configure cron jobs, or implement queue-based processing."
---

# Task and Queue Skill

## Overview
This skill helps you implement task scheduling and queue processing in cool-admin projects using MidwayJS cron and BullMQ.

## Built-in Tasks
### Setup
```ts
import { Configuration } from "@midwayjs/core";
import * as cron from "@midwayjs/cron";

@Configuration({
  imports: [cron],
  importConfigs: [join(__dirname, "config")],
})
export class AutoConfiguration {}
```

### Creating Tasks
```ts
import { Job, IJob } from "@midwayjs/cron";
import { FORMAT } from "@midwayjs/core";

@Job({
  cronTime: FORMAT.CRONTAB.EVERY_PER_30_MINUTE,
  start: true,
})
export class DataSyncCheckerJob implements IJob {
  async onTick() {
    // Task logic
  }
}
```

### Cron Expressions
```
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

## Local Tasks (v8.0+)
- Configure tasks in admin dashboard: `系统管理/任务管理/任务列表`
- No Redis dependency required
- Call service methods directly (e.g., `taskDemoService.test()`)

## Distributed Tasks
### Setup
```ts
import { Configuration } from "@midwayjs/core";
import * as task from "@cool-midway/task";

@Configuration({
  imports: [task],
  importConfigs: [join(__dirname, "./config")],
})
export class ContainerLifeCycle {}
```

### Redis Configuration
```ts
cool: {
  redis: {
    host: "127.0.0.1",
    port: 6379,
    password: "",
    db: 0,
  },
}
```

## Queues
### Creating Queues
```ts
import { BaseCoolQueue, CoolQueue } from "@cool-midway/task";

// Regular queue
@CoolQueue()
export class DemoCommQueue extends BaseCoolQueue {
  async data(job: any, done: any): Promise<void> {
    console.log("Data:", job.data);
    done();
  }
}

// Getter queue (manual consumption)
@CoolQueue({ type: "getter" })
export class DemoGetterQueue extends BaseCoolQueue {}
```

### Queue Operations
```ts
// Add to queue
this.demoCommQueue.add({ a: 2 });

// Get from getter queue
const job = await this.demoGetterQueue.getters.getJobs(['wait'], 0, 0, true);
await job[0].remove();
```

### Queue Options
- `priority`: Job priority (1 highest)
- `delay`: Delay in milliseconds
- `attempts`: Number of retry attempts
- `repeat`: Cron expression for repeated jobs
- `backoff`: Backoff strategy for retries
- `timeout`: Job timeout in milliseconds
- `removeOnComplete`: Remove job on completion
- `removeOnFail`: Remove job on failure

## Best Practices
- Use distributed tasks for multi-instance deployments
- Use queues for long-running or resource-intensive operations
- Set appropriate retry strategies
- Monitor task execution and queue status
- Use proper error handling in tasks
