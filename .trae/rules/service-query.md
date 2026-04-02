---
description: 服务查询操作(Service Query)
globs:
---
# 服务查询操作(Service Query)

## 普通查询(TypeOrm)

普通查询基于[TypeOrm](mdc:https:/typeorm.io)，点击查看官方详细文档

**示例**

```ts
import { DemoGoodsEntity } from "./../entity/goods";
import { Provide } from "@midwayjs/core";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { In, Repository } from "typeorm";

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	async typeorm() {
		// 新增单个，传入的参数字段在数据库中一定要存在
		await this.demoGoodsEntity.insert({ title: "xxx" });
		// 新增单个，传入的参数字段在数据库中可以不存在
		await this.demoGoodsEntity.save({ title: "xxx" });
		// 新增多个
		await this.demoGoodsEntity.save([{ title: "xxx" }]);
		// 查找单个
		await this.demoGoodsEntity.findOneBy({ id: 1 });
		// 查找多个
		await this.demoGoodsEntity.findBy({ id: In([1, 2]) });
		// 删除单个
		await this.demoGoodsEntity.delete(1);
		// 删除多个
		await this.demoGoodsEntity.delete([1]);
		// 根据ID更新
		await this.demoGoodsEntity.update(1, { title: "xxx" });
		// 根据条件更新
		await this.demoGoodsEntity.update({ price: 20 }, { title: "xxx" });
		// 多条件操作
		await this.demoGoodsEntity
			.createQueryBuilder()
			.where("id = :id", { id: 1 })
			.andWhere("price = :price", { price: 20 })
			.getOne();
	}
}
```

## 高级查询(SQL)

**1、普通 SQL 查询**

```ts
import { DemoGoodsEntity } from "./../entity/goods";
import { Provide } from "@midwayjs/core";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	/**
	 * 执行sql
	 */
	async sql(query) {
		return this.nativeQuery("select * from demo_goods a where a.id = ?", [query.id]);
	}
}
```

**2、分页 SQL 查询**

```ts
import { DemoGoodsEntity } from "./../entity/goods";
import { Provide } from "@midwayjs/core";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	/**
	 * 执行分页sql
	 */
	async sqlPage(query) {
		return this.sqlRenderPage("select * from demo_goods ORDER BY id ASC", query, false);
	}
}
```

**3、非 SQL 的分页查询**

```ts
import { DemoGoodsEntity } from "./../entity/goods";
import { Provide } from "@midwayjs/core";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { In, Repository } from "typeorm";

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	/**
	 * 执行entity分页
	 */
	async entityPage(query) {
		const find = this.demoGoodsEntity.createQueryBuilder();
		find.where("id = :id", { id: 1 });
		return this.entityRenderPage(find, query);
	}
}
```

**4、SQL 动态条件**

分页查询和普通的 SQL 查询都支持动态条件，通过`this.setSql(条件,sql语句,参数)`来配置

```ts
import { DemoGoodsEntity } from "./../entity/goods";
import { Provide } from "@midwayjs/core";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	/**
	 * 执行sql
	 */
	async sql(query) {
		return this.nativeQuery(`
    select * from demo_goods a
      WHERE 1=1
      ${this.setSql(query.id, "and a.id = ?", [query.id])}
    ORDER BY id ASC
    `);
	}
}
```
