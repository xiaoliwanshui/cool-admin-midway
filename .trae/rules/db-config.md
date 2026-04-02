---
description: 数据库配置(Database Config)
globs:
---
# 数据库配置(Database Config)

数据库使用的是`typeorm`库

官方文档：[https://typeorm.io](mdc:https:/typeorm.io)

Midway数据库文档：[https://www.midwayjs.org/docs/extensions/orm](https://www.midwayjs.org/docs/extensions/orm)

## 数据库配置

支持`Mysql`、`PostgreSQL`、`Sqlite`三种数据库

#### Mysql

`src/config/config.local.ts`

```ts
import { CoolConfig } from "@cool-midway/core";
import { MidwayConfig } from "@midwayjs/core";

export default {
  typeorm: {
    dataSource: {
      default: {
        type: "mysql",
        host: "127.0.0.1",
        port: 3306,
        username: "root",
        password: "123456",
        database: "cool",
        // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
        synchronize: true,
        // 打印日志
        logging: false,
        // 字符集
        charset: "utf8mb4",
        // 是否开启缓存
        cache: true,
        // 实体路径
        entities: ["**/modules/*/entity"],
      },
    },
  },
} as MidwayConfig;
```

#### PostgreSQL

需要先安装驱动

```shell
npm install pg --save
```

`src/config/config.local.ts`

```ts
import { CoolConfig } from "@cool-midway/core";
import { MidwayConfig } from "@midwayjs/core";

export default {
  typeorm: {
    dataSource: {
      default: {
        type: "postgres",
        host: "127.0.0.1",
        port: 5432,
        username: "postgres",
        password: "123456",
        database: "cool",
        // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
        synchronize: true,
        // 打印日志
        logging: false,
        // 字符集
        charset: "utf8mb4",
        // 是否开启缓存
        cache: true,
        // 实体路径
        entities: ["**/modules/*/entity"],
      },
    },
  },
} as MidwayConfig;
```

#### Sqlite

需要先安装驱动

```shell
npm install sqlite3 --save
```

`src/config/config.local.ts`

```ts
import { CoolConfig } from "@cool-midway/core";
import { MidwayConfig } from "@midwayjs/core";
import * as path from "path";

export default {
  typeorm: {
    dataSource: {
      default: {
        type: "sqlite",
        // 数据库文件地址
        database: path.join(__dirname, "../../cool.sqlite"),
        // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
        synchronize: true,
        // 打印日志
        logging: false,
        // 实体路径
        entities: ["**/modules/*/entity"],
      },
    },
  },
} as MidwayConfig;
```
