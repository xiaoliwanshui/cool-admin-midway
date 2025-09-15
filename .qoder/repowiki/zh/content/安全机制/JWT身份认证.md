# JWT身份认证

<cite>
**本文档引用文件**  
- [login.ts](file://src/modules/base/service/sys/login.ts)
- [config.default.ts](file://src/config/config.default.ts)
- [login.ts](file://src/modules/user/service/login.ts)
- [config.ts](file://src/modules/user/config.ts)
- [open.ts](file://src/modules/base/controller/admin/open.ts)
- [login.ts](file://src/modules/user/controller/app/login.ts)
</cite>

## 目录
1. [简介](#简介)
2. [用户登录流程](#用户登录流程)
3. [JWT Token 结构与生成机制](#jwt-token-结构与生成机制)
4. [Token 有效期与配置](#token-有效期与配置)
5. [前端 Token 存储与请求携带](#前端-token-存储与请求携带)
6. [Token 刷新与失效策略](#token-刷新与失效策略)
7. [异常处理与安全机制](#异常处理与安全机制)
8. [无状态认证分析](#无状态认证分析)
9. [总结](#总结)

## 简介
`cool-admin-midway` 是一个基于 Midway 框架的全栈管理后台系统，其身份认证机制采用 JWT（JSON Web Token）实现无状态登录。本系统通过服务端生成 Token 并由客户端存储，在后续请求中携带 Token 实现身份验证。该机制结合 Redis 缓存与密码版本控制，有效防止重放攻击，并支持单点登录（SSO）与多租户场景。

**Section sources**  
- [login.ts](file://src/modules/base/service/sys/login.ts#L1-L245)

## 用户登录流程

用户登录流程由 `BaseSysLoginService.login()` 方法实现，主要包含以下步骤：

1. **验证码校验**：通过 `captchaId` 和 `verifyCode` 校验图形验证码，验证码存储于 Redis 缓存中，校验成功后立即删除。
2. **用户凭证验证**：根据用户名查询用户，校验用户状态（`status`）及密码（使用 MD5 加密比对）。
3. **角色权限校验**：检查用户是否分配了有效角色，若无角色则拒绝登录。
4. **生成 Token 对**：调用 `generateToken()` 方法生成 `accessToken` 和 `refreshToken`。
5. **缓存用户信息**：将用户权限、部门、Token 等信息存入 Redis，用于后续权限校验和单点登录控制。

```mermaid
sequenceDiagram
participant 前端 as 前端
participant 控制器 as OpenController
participant 登录服务 as BaseSysLoginService
participant 数据库 as 数据库
participant 缓存 as Redis
前端->>控制器 : POST /admin/open/login
控制器->>登录服务 : 调用 login(loginDTO)
登录服务->>缓存 : 校验 captchaId & verifyCode
缓存-->>登录服务 : 验证结果
alt 验证失败
登录服务-->>控制器 : 抛出验证码错误
else 验证成功
登录服务->>数据库 : 查询用户(username)
数据库-->>登录服务 : 返回用户信息
alt 用户不存在或密码错误
登录服务-->>控制器 : 抛出账户错误
else 用户有效
登录服务->>数据库 : 查询用户角色(roleIds)
数据库-->>登录服务 : 返回角色列表
alt 无角色
登录服务-->>控制器 : 抛出无角色错误
else 有角色
登录服务->>登录服务 : generateToken(user, roleIds)
登录服务->>缓存 : 存储用户权限、Token等
登录服务-->>控制器 : 返回 token, refreshToken
end
end
end
控制器-->>前端 : 返回登录结果
```

**Diagram sources**  
- [login.ts](file://src/modules/base/service/sys/login.ts#L38-L84)
- [open.ts](file://src/modules/base/controller/admin/open.ts#L54-L61)

**Section sources**  
- [login.ts](file://src/modules/base/service/sys/login.ts#L38-L84)
- [open.ts](file://src/modules/base/controller/admin/open.ts#L54-L61)

## JWT Token 结构与生成机制

JWT Token 由三部分组成：Header、Payload 和 Signature，使用 HS256 算法进行签名。

### Token 组成结构

| 部分 | 内容说明 |
|------|----------|
| **Header** | 固定为 `{"alg": "HS256", "typ": "JWT"}`，表示使用 HS256 算法 |
| **Payload** | 包含用户身份信息，如 `userId`, `username`, `roleIds`, `tenantId`, `passwordVersion`, `isRefresh` 等 |
| **Signature** | 使用 `secret` 对 Header 和 Payload 进行 HS256 签名，防止篡改 |

### 生成机制

Token 由 `generateToken()` 方法生成：

- **accessToken**：包含用户基本信息和角色，用于常规接口鉴权。
- **refreshToken**：仅用于刷新 Token，`isRefresh` 字段为 `true`，过期时间更长。
- **密码版本控制**：Token 中包含 `passwordVersion`，当用户修改密码后，旧 Token 失效，提升安全性。

```mermaid
classDiagram
class BaseSysLoginService {
+login(login : LoginDTO)
+generateToken(user, roleIds, expire, isRefresh?)
+refreshToken(token : string)
}
class JwtUtil {
+sign(payload, secret, options)
+verify(token, secret)
}
BaseSysLoginService --> JwtUtil : 使用
BaseSysLoginService --> Redis : 缓存验证码、用户信息
BaseSysLoginService --> 数据库 : 查询用户、角色
```

**Diagram sources**  
- [login.ts](file://src/modules/base/service/sys/login.ts#L185-L217)

**Section sources**  
- [login.ts](file://src/modules/base/service/sys/login.ts#L185-L217)

## Token 有效期与配置

Token 的有效期在配置文件中定义，支持不同模块独立配置。

### 系统管理员 Token 配置
在 `config.default.ts` 中未直接定义，但在 `BaseSysLoginService` 中通过 `coolConfig.jwt.token` 读取：

- `expire`: accessToken 过期时间（秒）
- `refreshExpire`: refreshToken 过期时间（秒）
- `secret`: JWT 签名密钥

### 用户模块 Token 配置
在 `src/modules/user/config.ts` 中明确定义：

```ts
jwt: {
  expire: 60 * 60 * 24,           // 1天
  refreshExpire: 60 * 60 * 24 * 30, // 30天
  secret: '8685679a-0994-4f3e-aa8e-08a83204728ax',
}
```

### 安全影响
- **较短的 accessToken**：降低 Token 泄露后的风险窗口。
- **较长的 refreshToken**：提升用户体验，减少频繁登录。
- **密钥安全性**：`secret` 应保密，避免硬编码于客户端。

**Section sources**  
- [config.default.ts](file://src/config/config.default.ts#L1-L141)
- [config.ts](file://src/modules/user/config.ts#L25-L33)

## 前端 Token 存储与请求携带

### 存储方式
前端可选择以下方式存储 Token：
- **localStorage**：适用于 Web 应用，持久化存储，但存在 XSS 风险。
- **cookie**：可设置 `HttpOnly` 防止 XSS，但需防范 CSRF 攻击。

### 请求携带
在每次请求的 `Authorization` 头中携带 `accessToken`：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

Midway 框架通过中间件自动解析该 Header，验证 Token 并挂载用户信息至 `ctx.admin`。

**Section sources**  
- [open.ts](file://src/modules/base/controller/admin/open.ts#L54-L61)

## Token 刷新与失效策略

### 刷新机制
通过 `/admin/open/refreshToken` 接口刷新 Token：

1. 客户端传入 `refreshToken`。
2. 服务端验证 Token 并检查 `isRefresh` 字段。
3. 重新生成新的 `accessToken` 和 `refreshToken`。
4. 更新 Redis 中的 Token 缓存。

```mermaid
flowchart TD
A[客户端请求刷新] --> B{验证 refreshToken}
B --> |无效| C[返回 401]
B --> |有效| D[检查 isRefresh=true]
D --> |否| C
D --> |是| E[生成新 accessToken]
E --> F[生成新 refreshToken]
F --> G[更新 Redis 缓存]
G --> H[返回新 Token 对]
```

**Diagram sources**  
- [login.ts](file://src/modules/base/service/sys/login.ts#L219-L244)

**Section sources**  
- [login.ts](file://src/modules/base/service/sys/login.ts#L219-L244)

### 失效策略
- **主动退出**：调用 `logout()` 清除 Redis 中的用户缓存。
- **密码变更**：`passwordVersion` 变化导致旧 Token 验证失败。
- **单点登录（SSO）**：启用 SSO 时，同一用户只能在一个设备登录，新登录使旧 Token 失效。
- **Token 过期**：自动失效，需刷新或重新登录。

## 异常处理与安全机制

### 常见异常
| 异常类型 | 触发条件 | 处理方式 |
|--------|--------|--------|
| 验证码错误 | `verifyCode` 不匹配 | 返回 "验证码不正确" |
| 账号或密码错误 | 用户不存在或密码错误 | 返回 "账户或密码不正确" |
| 无角色 | 用户未分配角色 | 返回 "该用户未设置任何角色，无法登录" |
| refreshToken 无效 | 过期或非 refresh 类型 | 返回 401 及 "登录失效" |

### 安全机制
- **验证码防护**：防止暴力破解。
- **Redis 缓存控制**：限制登录尝试频率。
- **密码版本机制**：确保密码修改后旧 Token 失效。
- **Token 签名验证**：防止 Token 篡改。
- **防重放攻击**：通过 `passwordVersion` 和短期 `accessToken` 降低风险。

**Section sources**  
- [login.ts](file://src/modules/base/service/sys/login.ts#L38-L84)
- [login.ts](file://src/modules/user/service/login.ts#L264-L312)

## 无状态认证分析

### 优势
- **可扩展性**：服务端无需存储会话，适合分布式部署。
- **跨域支持**：Token 可在不同域间传递。
- **移动端友好**：适用于 APP、小程序等无 Cookie 环境。

### 潜在风险
- **Token 泄露**：一旦泄露，攻击者可在有效期内冒充用户。
- **无法主动失效**：除非使用黑名单或缓存机制。
- **性能开销**：每次请求需解析和验证 Token。

### 应对措施
- **短期 Token + 长期 RefreshToken**：平衡安全与体验。
- **Redis 缓存 Token 状态**：实现主动失效和 SSO。
- **HTTPS 传输**：防止中间人攻击。
- **前端安全存储**：避免 XSS 和 CSRF。

**Section sources**  
- [login.ts](file://src/modules/base/service/sys/login.ts#L153-L183)

## 总结
`cool-admin-midway` 的 JWT 认证机制设计严谨，结合验证码、角色校验、Redis 缓存和密码版本控制，实现了安全、高效的无状态登录。通过合理的 Token 生命周期管理和刷新机制，既保障了系统安全，又提升了用户体验。建议在生产环境中启用 HTTPS，并定期轮换 `secret` 密钥以进一步增强安全性。