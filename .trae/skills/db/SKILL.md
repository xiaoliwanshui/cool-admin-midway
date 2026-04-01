---
name: "db"
description: "Handles database operations for cool-admin projects. Invoke when user needs to create entities, perform database operations, or configure database connections."
---

# Database Skill

## Overview
This skill helps you work with databases in cool-admin projects, including entity creation, database operations, and connection configuration.

## Entity Creation
```ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../modules/base/entity/base';

@Entity('module_table')
export class ModuleEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: '名称' })
  name: string;

  @Column({ type: 'int', comment: '状态', default: 1 })
  status: number;
}
```

## Database Operations
### Repository Pattern
```ts
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';

@Provide()
export class ModuleService {
  @InjectEntityModel(ModuleEntity)
  moduleEntity: Repository<ModuleEntity>;

  async findAll() {
    return this.moduleEntity.find();
  }

  async findById(id: number) {
    return this.moduleEntity.findOne(id);
  }

  async create(data) {
    const entity = this.moduleEntity.create(data);
    return this.moduleEntity.save(entity);
  }
}
```

### Query Builder
```ts
async findWithConditions(conditions) {
  const queryBuilder = this.moduleEntity.createQueryBuilder('m');
  
  if (conditions.name) {
    queryBuilder.where('m.name LIKE :name', { name: `%${conditions.name}%` });
  }
  
  if (conditions.status) {
    queryBuilder.andWhere('m.status = :status', { status: conditions.status });
  }
  
  return queryBuilder.getMany();
}
```

## Database Configuration
### app/config/config.default.ts
```ts
export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'password',
        database: 'cool-admin',
        synchronize: true,
        logging: false,
        entities: ['**/entity/**/*.ts'],
      },
    },
  },
};
```

## Data Initialization
Use `db.json` for initial data:
```json
{
  "table_name": [
    {
      "field1": "value1",
      "field2": "value2"
    }
  ]
}
```

## Best Practices
- Use `BaseEntity` for entity inheritance
- Follow naming conventions for tables and columns
- Use proper data types
- Implement indexes for frequently queried fields
- Use transactions for complex operations
- Avoid N+1 query problems
