---
name: "tenant"
description: "Handles multi-tenant functionality for cool-admin projects. Invoke when user needs to implement multi-tenant architecture, tenant isolation, or tenant-specific configurations."
---

# Tenant Management Skill

## Overview
This skill helps you implement multi-tenant functionality in cool-admin projects to support multiple tenants with isolated data and configurations.

## Tenant Isolation
### Database Isolation Strategies
- **Single Database, Multiple Schemas**: Separate schemas for each tenant
- **Multiple Databases**: Separate databases for each tenant
- **Shared Database, Shared Schema**: Tenant ID in every table

## Tenant Configuration
### Tenant Model
```ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../modules/base/entity/base';

@Entity('sys_tenant')
export class TenantEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '租户名称' })
  name: string;

  @Column({ type: 'varchar', length: 255, comment: '租户域名' })
  domain: string;

  @Column({ type: 'int', comment: '状态', default: 1 })
  status: number;

  @Column({ type: 'json', comment: '租户配置', nullable: true })
  config: any;
}
```

## Tenant Middleware
### Tenant Identification
```ts
import { Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class TenantMiddleware {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // Identify tenant from domain, header, or token
      const tenantId = this.identifyTenant(ctx);
      
      if (tenantId) {
        ctx.tenantId = tenantId;
        // Set tenant-specific database connection
        await this.setTenantConnection(ctx, tenantId);
      }
      
      await next();
    };
  }

  identifyTenant(ctx: Context): number {
    // Identify tenant from domain
    const domain = ctx.host;
    // Identify tenant from header
    const tenantHeader = ctx.get('X-Tenant-ID');
    // Identify tenant from token
    // ...
    
    return tenantId;
  }
}
```

## Tenant Service
### Tenant Operations
```ts
import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from '../entity/tenant';

@Provide()
export class TenantService {
  @InjectEntityModel(TenantEntity)
  tenantEntity: Repository<TenantEntity>;

  async getTenantById(id: number) {
    return this.tenantEntity.findOne(id);
  }

  async getTenantByDomain(domain: string) {
    return this.tenantEntity.findOne({ where: { domain } });
  }

  async createTenant(tenantData) {
    const tenant = this.tenantEntity.create(tenantData);
    return this.tenantEntity.save(tenant);
  }

  async updateTenant(id: number, tenantData) {
    await this.tenantEntity.update(id, tenantData);
    return this.tenantEntity.findOne(id);
  }
}
```

## Tenant-Specific Data
### Data Filtering
```ts
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';

@Provide()
export class UserService {
  @InjectEntityModel(UserEntity)
  userEntity: Repository<UserEntity>;

  async getUsers(tenantId: number) {
    return this.userEntity.find({ where: { tenantId } });
  }

  async createUser(userData, tenantId: number) {
    const user = this.userEntity.create({
      ...userData,
      tenantId,
    });
    return this.userEntity.save(user);
  }
}
```

## Best Practices
- Use tenant ID in all tenant-specific tables
- Implement tenant-level authentication
- Use tenant-specific configurations
- Monitor tenant resource usage
- Implement tenant isolation at all levels
- Use dedicated database connections for each tenant
- Implement tenant backup and restore

## Common Use Cases
- SaaS applications
- Multi-organization systems
- Multi-customer platforms
- Franchise management systems
- Multi-department internal applications

## Tenant Management UI
- Tenant dashboard
- Tenant creation and configuration
- Tenant resource monitoring
- Tenant billing and usage tracking
- Tenant user management
