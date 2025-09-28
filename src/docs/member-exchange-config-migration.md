# 会员兑换配置模块迁移指南

## 概述
本文档介绍如何将硬编码的会员兑换规格配置迁移到数据库驱动的配置化系统。

## 数据库结构

### 表结构
```sql
CREATE TABLE `user_member_exchange_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `createUserId` bigint(20) DEFAULT NULL,
  `updateUserId` bigint(20) DEFAULT NULL,
  `exchangeType` varchar(255) NOT NULL COMMENT '兑换类型',
  `exchangeName` varchar(255) NOT NULL COMMENT '兑换名称',
  `requiredScore` int(11) NOT NULL DEFAULT '0' COMMENT '所需积分',
  `days` int(11) NOT NULL DEFAULT '0' COMMENT '兑换天数',
  `enabled` tinyint(4) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `sort` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_exchange_type` (`exchangeType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员兑换配置表';
```

### 初始数据
```sql
INSERT INTO `user_member_exchange_config` (`exchangeType`, `exchangeName`, `requiredScore`, `days`, `enabled`, `sort`, `remark`) VALUES
('THREE_DAYS', '3天会员', 10, 3, 1, 1, '3天体验会员'),
('ONE_WEEK', '7天会员', 30, 7, 1, 2, '一周会员套餐');
```

## API接口

### 管理端接口
- `POST /admin/user/memberExchangeConfig/add` - 添加配置
- `POST /admin/user/memberExchangeConfig/update` - 更新配置
- `POST /admin/user/memberExchangeConfig/delete` - 删除配置
- `POST /admin/user/memberExchangeConfig/list` - 获取配置列表
- `POST /admin/user/memberExchangeConfig/page` - 分页查询配置
- `POST /admin/user/memberExchangeConfig/info` - 获取配置详情
- `POST /admin/user/memberExchangeConfig/initDefault` - 初始化默认配置
- `POST /admin/user/memberExchangeConfig/toggle` - 启用/禁用配置
- `POST /admin/user/memberExchangeConfig/enabled` - 获取启用的配置

### 应用端接口
- `POST /app/user/memberExchangeConfig/list` - 获取可用配置列表
- `POST /app/user/memberExchangeConfig/types` - 获取有效的兑换类型

## 主要改进

### 1. 配置化管理
- 兑换规格可通过管理后台动态配置
- 支持启用/禁用特定兑换类型
- 支持排序和备注管理

### 2. 类型安全
- 运行时动态验证兑换类型的有效性
- 保持原有的 TypeScript 类型安全特性

### 3. 扩展性
- 可轻松添加新的兑换类型
- 支持未来扩展（如折扣、限时活动等）

### 4. 维护性
- 业务逻辑与配置数据分离
- 支持配置的版本管理和审计

## 使用示例

### 管理端初始化配置
```typescript
// 初始化默认配置
await memberExchangeConfigService.initDefaultConfigs();

// 添加新配置
await memberExchangeConfigService.saveConfig({
  exchangeType: 'ONE_MONTH',
  exchangeName: '30天会员',
  requiredScore: 100,
  days: 30,
  enabled: true,
  sort: 3,
  remark: '月度会员套餐'
});
```

### 应用端使用
```typescript
// 获取可用配置
const configs = await memberExchangeConfigService.getEnabledConfigs();

// 兑换会员
await memberService.exchangeByScore(userId, 'THREE_DAYS');
```

## 迁移步骤

1. **部署新实体和服务**
   - 确保新的实体类已添加到 entities.ts
   - 部署包含新服务的代码

2. **初始化数据库**
   - 运行建表语句创建配置表
   - 调用 `/admin/user/memberExchangeConfig/initDefault` 初始化默认配置

3. **验证功能**
   - 测试管理端配置管理功能
   - 测试应用端兑换功能是否正常

4. **清理旧代码**
   - 原有的 `MEMBER_EXCHANGE_CONFIG` 常量已被移除
   - 服务方法已重构为使用数据库配置

## 注意事项

1. **数据一致性**：确保在切换前后，兑换功能的行为保持一致
2. **性能考虑**：配置查询会增加数据库访问，建议考虑缓存优化
3. **权限控制**：管理端配置功能需要适当的权限控制
4. **备份恢复**：重要配置变更前建议进行数据备份