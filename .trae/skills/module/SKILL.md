---
name: "module"
description: "Handles module development for cool-admin projects. Invoke when user needs to create new modules, configure module structure, or set up module-specific features."
---

# Module Development Skill

## Overview
This skill helps you create and configure modules in cool-admin projects following best practices.

## Module Structure
Recommended directory structure:
```
├── modules
│   └── module-name
│       └── controller/
│       │   └── admin/ (后台管理接口)
│       │   └── app/ (应用接口)
│       └── dto/ (参数校验)
│       └── entity/ (实体类)
│       └── middleware/ (中间件)
│       └── schedule/ (定时任务)
│       └── service/ (业务逻辑)
│       └── config.ts (模块配置)
│       └── db.json (初始化数据)
│       └── menu.json (初始化菜单)
```

## Module Configuration
### config.ts
```ts
import { ModuleConfig } from '@cool-midway/core';

export default () => {
  return {
    name: '模块名称',
    description: '模块描述',
    middlewares: [],
    globalMiddlewares: [],
    order: 1,
    // 其他配置
  } as ModuleConfig;
};
```

## Data Import
Use `db.json` to pre-import data:
```json
{
  "dict_type": [
    {
      "name": "类型名称",
      "key": "typeKey",
      "@childDatas": {
        "dict_info": [
          {
            "typeId": "@id",
            "name": "选项名称",
            "value": "0"
          }
        ]
      }
    }
  ]
}
```

## Menu Import
Use `menu.json` to pre-import menus:
```json
[
  {
    "name": "菜单名称",
    "router": "/module/path",
    "perms": null,
    "type": 1,
    "icon": "icon-name",
    "orderNum": 0,
    "viewPath": "modules/module/views/page.vue",
    "keepAlive": true,
    "isShow": true
  }
]
```

## Best Practices
- Always create `config.ts` for module configuration
- Use consistent naming conventions
- Follow the recommended directory structure
- Use `BaseEntity` for entity inheritance
- Import BaseEntity as: `import { BaseEntity } from '../../modules/base/entity/base';`

## Module Loading
- Module loading order is controlled by the `order` property
- Higher order values load first (default: 0)
- Modules are loaded automatically based on directory structure
