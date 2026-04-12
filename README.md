<p align="center">
  <a href="https://midwayjs.org/" target="blank"><img src="https://cool-show.oss-cn-shanghai.aliyuncs.com/admin/logo.png" width="200" alt="Cool Admin Logo" /></a>
</p>

<h1 align="center">Cool Admin Midway</h1>

<p align="center">
  <strong>一个很酷的后台权限管理系统</strong><br/>
  基于 Node.js + TypeScript + MidwayJS 的现代化企业级后台管理系统<br/>
  支持 AI 编码、流程编排、模块化、插件化、极速开发 CRUD
</p>

<p align="center">
    <a href="https://github.com/cool-team-official/cool-admin-midway/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="GitHub license" />
    <a href=""><img src="https://img.shields.io/github/package-json/v/cool-team-official/cool-admin-midway?style=flat-square" alt="GitHub tag"></a>
    <img src="https://img.shields.io/github/last-commit/cool-team-official/cool-admin-midway?style=flat-square" alt="GitHub tag"></a>
    <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node version">
    <img src="https://img.shields.io/badge/typescript-5.8.2-blue" alt="TypeScript version">
</p>

<p align="center">
  <a href="https://cool-js.com" target="_blank">📖 官方文档</a> |
  <a href="https://show.cool-admin.com" target="_blank">🎯 在线演示</a> |
  <a href="https://www.bilibili.com/video/BV1j1421R7aB" target="_blank">📺 视频教程</a>
</p>

---

## 🚀 项目概述

Cool Admin Midway 是一个基于 **Node.js** 和 **TypeScript** 的现代化后台权限管理系统，旨在通过现代化技术栈和 AI 编码能力，快速构建迭代后台管理系统。

### 🎯 目标用户
- 👨‍💻 **开发者**：前后端开发人员
- 🏢 **企业IT团队**：中小型企业技术团队
- 🛠️ **系统集成商**：需要快速交付的项目团队

### 🎆 核心价值
- **快速开发**：极速构建 CRUD 功能，降低开发复杂度
- **AI 赋能**：基于大模型的智能编码和自动翻译
- **扩展性强**：支持多租户、多语言、流程编排
- **部署灵活**：支持 Docker、普通服务器、原生打包等多种部署方式

## ✨ 特色功能

### 🤖 AI 编码
通过微调大模型学习框架特有写法，实现简单功能从 API 接口到前端页面的一键生成
- 📝 **智能代码生成**：自动生成 CRUD 接口和前端页面
- ⚙️ **框架适配**：深度学习框架特性，生成的代码更符合规范
- 🚀 **效率提升**：显著减少重复性工作，提升开发效率

[**查看 AI 编码详情**](https://node.cool-admin.com/src/guide/ai.html)

### 🔄 流程编排
通过拖拽编排方式，即可实现类似像智能客服这样的复杂业务功能
- 🎨 **可视化编排**：拖拽式流程设计器
- 🔗 **业务集成**：支持复杂业务逻辑的快速实现
- 📊 **数据流转**：灵活的数据处理和传递机制

[**查看流程编排详情**](https://node.cool-admin.com/src/guide/flow.html)

### 🏢 多租户支持
采用全局动态注入查询条件的方式，实现真正的多租户隔离
- 🔒 **数据隔离**：自动注入租户条件，确保数据安全
- ⚙️ **配置灵活**：支持多种租户模式和权限策略
- 🚀 **性能优化**：动态查询优化，不影响系统性能

[**查看多租户详情**](https://node.cool-admin.com/src/guide/core/tenant.html)

### 🌍 多语言支持
基于大模型自动翻译，无需更改原有代码
- 🤖 **智能翻译**：利用 AI 大模型进行高质量翻译
- 📝 **无侵入性**：不需要修改业务代码逻辑
- 🔄 **实时更新**：支持语言包的动态加载和更新

[**查看多语言详情**](https://node.cool-admin.com/src/guide/core/i18n.html)

### 📦 原生打包
支持打包成 exe 等安装包，可直接运行在 Windows、Mac、Linux 等操作系统上
- 🖥️ **跨平台**：支持 Windows、macOS、Linux 多平台
- 👨‍💼 **企业部署**：适合企业内部系统的快速部署
- 🔒 **安全可靠**：独立可执行文件，不依赖运行时环境

[**查看原生打包详情**](https://node.cool-admin.com/src/guide/core/pkg.html)

### 🧩 模块化设计
- 📚 **清晰架构**：代码按功能模块划分，便于维护
- 🔄 **热插拔**：支持模块的动态加载和卸载
- ⚙️ **独立配置**：每个模块都有独立的配置和依赖

### 🔌 插件化架构
- 🛍️ **丰富插件**：支付、短信、邮件等常用功能插件
- 🔧 **易于扩展**：标准化的插件开发接口
- 📦 **一键安装**：支持插件的在线安装和管理

![Cool Admin Flow](https://cool-show.oss-cn-shanghai.aliyuncs.com/admin/flow.png)

## 📚 技术架构

### 📋 系统架构

### 全栈解决方案

本项目是 **cool-admin** 生态系统的一部分，采用前后端分离的架构：

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Flutter App   │ ──────▶ │  cool-admin-    │ ──────▶ │  cool-admin-    │
│  (移动端前端)   │  HTTP   │   midway        │  MySQL  │   Database      │
│                 │ ◀────── │  (服务端后端)   │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         ▲
         │
         │
┌─────────────────┐
│  cool-admin-vue │
│  (后台管理前端) │
└─────────────────┘
```

#### 📌 相关项目

| 项目         | 说明                                        | 地址                                                                        |
| ---------- | ----------------------------------------- | ------------------------------------------------------------------------- |
| **移动端应用**  | 本项目的 Flutter 客户端                          | `https://github.com/xiaoliwanshui/cool-admin-flutter`  |
| **后台管理前端** | 基于 Vue3 + Element Plus 的后台管理系统            | `https://github.com/xiaoliwanshui/cool-admin-vue`          |
| **服务端后端**  | 基于 Node.js + Midway + TypeScript 的 API 服务 | `https://github.com/xiaoliwanshui/cool-admin-midway`    |

### 🎨 技术选型

#### 后端技术栈
- **运行时**: Node.js (>=18.x)
- **编程语言**: TypeScript (5.8.2)
- **Web 框架**: MidwayJS + Koa.js
- **ORM 框架**: TypeORM (定制版 @cool-midway/typeorm@0.3.20)
- **缓存**: Redis + cache-manager-ioredis-yet
- **任务调度**: Cron
- **文件上传**: @midwayjs/upload
- **参数验证**: @midwayjs/validate
- **API 文档**: Swagger
- **安全认证**: JWT + SVG 验证码

#### 前端技术栈
- **框架**: Vue.js 3.x
- **UI 组件库**: Element-Plus
- **状态管理**: Pinia
- **路由管理**: Vue-Router
- **渲染方式**: JSX

#### 数据库支持
- **MySQL** (>=5.7，推荐 8.0)
- **PostgreSQL**
- **SQLite**

### 🏠 架构设计

#### 设计模式
- **模块化设计**: 代码按功能模块划分，便于维护
- **插件化设计**: 通过插件扩展功能（支付、短信、邮件等）
- **装饰器模式**: 使用 TypeORM 和 Midway 框架的装饰器特性
- **依赖注入**: Midway 框架内置依赖注入机制

#### 性能优化
- **Redis 缓存**: 数据缓存和会话管理
- **数据库优化**: TypeORM 查询优化
- **多租户查询**: 动态注入查询条件

#### 安全特性
- **JWT 认证**: 用户身份认证和授权
- **权限控制**: 基于角色的权限管理
- **日志记录**: 完整的操作日志和审计跟踪

### 📊 项目结构

```
cool-admin-midway/
├── public/                    # 静态资源文件
│   ├── css/                   # 样式文件
│   ├── js/                    # JavaScript 文件
│   ├── swagger/               # Swagger UI 文档
│   └── index.html             # 首页文件
├── src/                       # 源代码目录
│   ├── comm/                  # 公共工具类
│   │   ├── crypto.ts          # 加密工具
│   │   ├── path.ts            # 路径处理
│   │   ├── port.ts            # 端口配置
│   │   └── utils.ts           # 通用工具
│   ├── config/                # 配置文件
│   │   ├── config.default.ts  # 默认配置
│   │   ├── config.local.ts    # 本地开发配置
│   │   └── config.prod.ts     # 生产环境配置
│   ├── modules/               # 功能模块
│   │   ├── application/       # 应用管理模块
│   │   ├── base/              # 基础模块（权限、日志、登录等）
│   │   ├── demo/              # 示例模块（商品管理、队列等）
│   │   ├── dict/              # 数据字典模块
│   │   ├── echart/            # 图表统计模块
│   │   ├── plugin/            # 插件管理模块
│   │   ├── recycle/           # 回收站模块
│   │   ├── space/             # 存储空间模块
│   │   ├── swagger/           # API 文档模块
│   │   ├── task/              # 任务调度模块
│   │   ├── user/              # 用户管理模块
│   │   └── video/             # 视频管理模块
│   ├── configuration.ts       # 全局配置
│   ├── entities.ts            # 实体定义
│   └── interface.ts           # 接口定义
├── test/                      # 单元测试目录
├── typings/                   # 类型定义文件
├── Dockerfile                 # Docker 构建文件
├── docker-compose.yml         # Docker Compose 配置
├── package.json               # 项目依赖和脚本配置
├── tsconfig.json              # TypeScript 编译配置
└── bootstrap.js               # 引导启动文件
```

### 🛠️ 开发环境要求

#### 必需工具
- **Node.js** (>=18.x) - JavaScript 运行时环境
- **npm** 或 **pnpm** - 包管理器
- **TypeScript** - 编译工具
- **数据库**: MySQL (>=5.7，推荐 8.0) / PostgreSQL / SQLite
- **Redis** - 缓存服务

#### 可选工具
- **Docker** & **Docker Compose** - 容器化部署
- **PM2** - 进程管理器
- **Jest** - 单元测试框架

---

## 🚀 快速开始

### 1️⃣ 环境准备

#### 数据库安装
可以选择以下任意一种数据库：

**MySQL (推荐)**
```bash
# 使用 Docker 安装
docker run -d --name mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=cool \
  mysql:8.0
```

**Redis**
```bash
# 使用 Docker 安装
docker run -d --name redis \
  -p 6379:6379 \
  redis:latest
```

或者使用项目提供的 Docker Compose：
```bash
# 启动数据库环境
docker-compose up -d
```

### 2️⃣ 项目安装

#### 克隆项目
```bash
# 克隆代码仓库
git clone https://github.com/cool-team-official/cool-admin-midway.git
cd cool-admin-midway
```

#### 安装依赖
```bash
# 使用 npm
npm install

# 或者使用 pnpm (推荐)
pnpm install
```

### 3️⃣ 配置数据库

修改数据库配置文件 `src/config/config.local.ts`：

**MySQL 配置示例**：
```typescript
// src/config/config.local.ts
export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: '127.0.0.1',
        port: 3306,
        username: 'root',
        password: '123456',
        database: 'cool',
        // 自动建表 - 注意：生产环境请设置为 false
        synchronize: true,
        // 打印 SQL 日志
        logging: false,
        // 字符集
        charset: 'utf8mb4',
        // 是否开启缓存
        cache: true,
        // 实体路径
        entities: ['**/modules/*/entity'],
      },
    },
  },
  // Redis 配置
  redis: {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '', // 如果有密码请填写
      db: 0,
    },
  },
};
```

**其他数据库配置**：
- [PostgreSQL 配置](https://cool-js.com/admin/node/quick.html#postgresql)
- [SQLite 配置](https://cool-js.com/admin/node/quick.html#sqlite)

### 4️⃣ 启动项目

```bash
# 开发环境启动
npm run dev

# 或者使用 pnpm
pnpm dev
```

等待编译完成后，浏览器访问：
- **本地地址**: [http://localhost:8001](http://localhost:8001)
- **API 文档**: [http://localhost:8001/swagger](http://localhost:8001/swagger)

> ✨ **提示**: 首次启动会自动初始化数据库并导入初始数据

### 5️⃣ 默认登录信息

- **管理员账号**: `admin`
- **默认密码**: `123456`

---

## 🔧 CRUD 快速开发

大部分的后台管理系统都是对数据进行管理，Cool Admin 对 CRUD 场景进行了大量封装，让编码量极其少。

### 📋 新建数据表

在 `src/modules/demo/entity/goods.ts` 中定义实体，项目启动时数据库会自动创建该表：

```typescript
import { BaseEntity } from '../../base/entity/base';
import { Column, Entity } from 'typeorm';

/**
 * 商品管理
 */
@Entity('demo_app_goods')
export class DemoAppGoodsEntity extends BaseEntity {
  @Column({ comment: '标题' })
  title: string;

  @Column({ comment: '图片' })
  pic: string;

  @Column({ comment: '价格', type: 'decimal', precision: 5, scale: 2 })
  price: number;

  @Column({ comment: '库存', default: 0 })
  stock: number;

  @Column({ comment: '状态', default: 1 })
  status: number;
}
```

### 🚀 编写 API 接口

在 `src/modules/demo/controller/app/goods.ts` 中，仅需几行代码即可快速编写 6 个 API 接口：

```typescript
import { CoolController, BaseController } from '@cool-midway/core';
import { DemoAppGoodsEntity } from '../../entity/goods';
import { Get } from '@midwayjs/core';

/**
 * 商品管理
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: DemoAppGoodsEntity,
})
export class DemoAppGoodsController extends BaseController {
  /**
   * 自定义接口示例
   */
  @Get('/other')
  async other() {
    return this.ok('你好，Cool Admin!');
  }

  /**
   * 商品统计接口
   */
  @Get('/statistics')
  async statistics() {
    const totalCount = await this.demoAppGoodsEntity.count();
    const activeCount = await this.demoAppGoodsEntity.count({ where: { status: 1 } });
    
    return this.ok({
      total: totalCount,
      active: activeCount,
      inactive: totalCount - activeCount,
    });
  }
}
```

### 🚀 自动生成的 API 接口

上面的代码自动生成了以下 6 个 REST API 接口：

- `POST /app/demo/goods/add` - **新增商品**
- `POST /app/demo/goods/delete` - **删除商品**
- `POST /app/demo/goods/update` - **更新商品**
- `GET /app/demo/goods/info` - **获取单个商品信息**
- `POST /app/demo/goods/list` - **获取商品列表**
- `POST /app/demo/goods/page` - **分页查询**（包含模糊查询、字段全匹配等）

### 🎨 高级特性

- **自动参数验证**: 基于实体定义自动验证
- **权限控制**: 支持接口级别的权限管理
- **数据过滤**: 自动过滤敏感字段
- **多租户支持**: 自动注入租户查询条件
- **缓存支持**: 可选的查询结果缓存

---

## 🚀 部署指南

Cool Admin Midway 支持多种部署方式，满足不同场景的需求。

### 🚀 生产环境部署

#### 1. 普通服务器部署

```bash
# 1. 构建项目
npm run build

# 2. 直接启动
npm run start

# 3. 或者使用 PM2 管理进程
npm run pm2:start  # 启动
npm run pm2:stop   # 停止
```

#### 2. Docker 部署

```bash
# 构建镜像
docker build -t cool-admin-midway .

# 运行容器
docker run -d \
  --name cool-admin \
  -p 8001:8001 \
  cool-admin-midway
```

#### 3. Docker Compose 部署

```bash
# 使用项目提供的 docker-compose.yml
docker-compose up -d
```

#### 4. 原生打包部署

```bash
# 打包成可执行文件
npm run pkg

# 生成的文件在 build 目录下
# 可直接运行在 Windows/Mac/Linux 上
```

### ⚠️ 生产环境注意事项

1. **数据库配置**: 修改 `src/config/config.prod.ts`
2. **关闭自动建表**: `synchronize: false`
3. **环境变量**: 设置 `NODE_ENV=prod`
4. **安全配置**: JWT 密钥、数据库密码等

[**查看完整部署文档**](https://node.cool-admin.com/src/guide/deploy.html)

---

## 🛠️ 开发工具

### 📝 代码规范

```bash
# 代码格式检查
npm run lint

# 自动修复格式问题
npm run lint:fix
```

### 🧪 单元测试

```bash
# 运行测试
npm run test

# 运行测试并生成覆盖率报告
npm run cov
```

### 📊 性能监控

项目内置 Prometheus 指标采集，支持：
- HTTP 请求指标
- 系统资源使用情况
- 自定义业务指标

---

## 📚 学习资源

### 📹 视频教程
- [**官方 B 站视频教程**](https://www.bilibili.com/video/BV1j1421R7aB) - 完整的从入门到实战教程
- [**AI 极速编码演示**](https://node.cool-admin.com/src/guide/ai.html) - 体验 AI 辅助开发

### 🌐 在线演示
- **演示地址**: [https://show.cool-admin.com](https://show.cool-admin.com)
- **登录信息**: 用户名 `admin`，密码 `123456`

<img src="https://cool-show.oss-cn-shanghai.aliyuncs.com/admin/home-mini.png" alt="Cool Admin 管理后台" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">

### 📄 文档链接
- [**官方文档**](https://cool-js.com) - 完整的开发文档
- [**API 文档**](http://localhost:8001/swagger) - 在线 API 文档（需启动项目）

### 📚 前端项目
- [**GitHub**](https://github.com/cool-team-official/cool-admin-vue) - 主仓库
- [**Gitee**](https://gitee.com/cool-team-official/cool-admin-vue) - 国内镜像
- [**GitCode**](https://gitcode.com/cool_team/cool-admin-vue) - 备用镜像

---

## 👥 社区支持

### 💬 微信交流群

<img width="260" src="https://cool-show.oss-cn-shanghai.aliyuncs.com/admin/wechat.jpeg?v=1" alt="Cool Admin 微信群" style="border-radius: 8px;">

### 🔗 相关链接
- **Java 版本**: [cool-admin-java](https://cool-js.com/admin/java/introduce.html)
- **优惠云服务器**: [阿里云、腾讯云、华为云低价云服务器](https://cool-js.com/service/cloud)

---

## 📜 许可证

本项目基于 [MIT License](https://github.com/cool-team-official/cool-admin-midway/blob/master/LICENSE) 开源协议发布。

## ❤️ 支持项目

如果这个项目对您有帮助，请考虑：

- ⭐ 给项目点个 Star
- 🐛 提交 Issue 或 Pull Request
- 💬 加入微信交流群
- 📝 分享给更多朋友

---

<p align="center">
  <strong>🚀 立即开始你的 Cool Admin 之旅！</strong>
</p>

<p align="center">
  <a href="https://cool-js.com">📖 查看文档</a> |
  <a href="https://show.cool-admin.com">🎯 在线体验</a> |
  <a href="https://www.bilibili.com/video/BV1j1421R7aB">📺 学习视频</a>
</p>
