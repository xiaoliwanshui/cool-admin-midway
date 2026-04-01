---
name: "authority"
description: "Manages authority and permissions for cool-admin projects. Invoke when user needs to set up authentication, role-based access, or JWT token management."
---

# Authority Management Skill

## Overview
This skill helps you implement authority management in cool-admin projects using JWT-based authentication.

## Key Features
- JWT token generation and validation
- Role-based access control
- Permission configuration
- Token refresh and expiration handling
- Middleware for authority validation

## Usage Examples

### Setting up JWT Authentication
```ts
// Generate token for user
const token = await this.generateToken(user, roleIds, expire);
const refreshToken = await this.generateToken(user, roleIds, refreshExpire, true);
```

### Permission Configuration
- Add permissions in the admin dashboard: `系统管理/权限管理/菜单列表`
- Assign roles to users with specific permissions

### Authority Middleware
```ts
@Middleware()
export class BaseAuthorityMiddleware implements IMiddleware<Context, NextFunction> {
  // Authority validation logic
}
```

### Token Refresh
- Use refreshToken to get new tokens without re-login
- Default token expiration: 2 hours
- Default refresh token expiration: 30 days

## Best Practices
- Use `/admin/**` prefix for admin interfaces requiring authentication
- Use `/app/**` prefix for app/mini-program interfaces
- Use `@Controller('/open')` for public interfaces that don't require authentication
- Store user permissions in cache for faster validation

## Common Issues
- **Token expired**: Use refreshToken to get a new token
- **Permission denied**: Check user roles and permissions in the admin dashboard
- **SSO issues**: Verify JWT secret configuration
