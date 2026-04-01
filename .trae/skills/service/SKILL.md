---
name: "service"
description: "Handles service layer development for cool-admin projects. Invoke when user needs to implement business logic, data processing, or integrate external services."
---

# Service Development Skill

## Overview
This skill helps you create and configure service layer components in cool-admin projects for implementing business logic.

## Service Structure
```ts
import { Provide, Inject } from '@midwayjs/core';

@Provide()
export class ModuleService {
  @Inject()
  logger;

  async getList(query) {
    // Business logic
  }

  async create(data) {
    // Business logic
  }
}
```

## Dependency Injection
- `@Provide()`: Register service as injectable
- `@Inject()`: Inject dependencies
- `@InjectClient()`: Inject database clients
- `@Config()`: Inject configuration

## Service Methods
- **CRUD Operations**: Create, Read, Update, Delete
- **Business Logic**: Core application logic
- **Data Processing**: Transform and process data
- **External Integration**: Integrate with external services

## Best Practices
- Keep business logic in services (not controllers)
- Use proper error handling
- Implement transaction management for database operations
- Use caching for frequently accessed data
- Follow single responsibility principle

## Service Layering
- **Core Services**: Business logic
- **Repository Services**: Data access
- **Integration Services**: External system integration
- **Utility Services**: Common functions

## Transaction Management
```ts
import { Transactional } from '@midwayjs/typeorm';

@Provide()
export class ModuleService {
  @Transactional()
  async createWithTransaction(data) {
    // All operations in this method are transactional
  }
}
```
