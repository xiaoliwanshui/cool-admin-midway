---
name: "controller"
description: "Handles controller development for cool-admin projects. Invoke when user needs to create API endpoints, configure routes, or implement request validation."
---

# Controller Development Skill

## Overview
This skill helps you create and configure controllers in cool-admin projects for handling API requests.

## Controller Structure
```ts
import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@midwayjs/core';

@Controller('/admin/module')
export class ModuleController {
  @Get('/list')
  async list(@Query() query) {
    // Handle GET request
  }

  @Post('/create')
  async create(@Body() body) {
    // Handle POST request
  }
}
```

## Route Prefixes
- `/admin/**`: Admin interface (requires authentication)
- `/app/**`: App/mini-program interface (requires authentication)
- `/open/**`: Public interface (no authentication required)

## Request Methods
- `@Get()`: Handle GET requests
- `@Post()`: Handle POST requests
- `@Put()`: Handle PUT requests
- `@Delete()`: Handle DELETE requests
- `@Patch()`: Handle PATCH requests

## Request Parameters
- `@Body()`: Get request body
- `@Query()`: Get query parameters
- `@Param()`: Get route parameters
- `@Headers()`: Get request headers
- `@Session()`: Get session data

## Validation
Use DTOs for request validation:
```ts
import { Rule, RuleType } from '@midwayjs/validate';

export class CreateDTO {
  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.number().min(0).max(100))
  age: number;
}
```

## Route Tags
Use route tags to control authentication:
```ts
@Controller('/admin/module')
export class ModuleController {
  @Get('/open/list', { ignoreAuth: true })
  async publicList() {
    // No authentication required
  }
}
```

## Best Practices
- Keep controllers lean (delegate business logic to services)
- Use proper HTTP methods for CRUD operations
- Implement proper error handling
- Use DTOs for request validation
- Follow RESTful API design principles
