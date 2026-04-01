---
name: "exception"
description: "Handles exception handling for cool-admin projects. Invoke when user needs to implement error handling, create custom exceptions, or configure error responses."
---

# Exception Handling Skill

## Overview
This skill helps you implement robust exception handling in cool-admin projects to improve error management and user experience.

## Custom Exceptions
### Creating Custom Exceptions
```ts
import { CoolCommException } from '@cool-midway/core';

export class BusinessException extends CoolCommException {
  constructor(message: string, code?: number) {
    super(message, code);
  }
}
```

### Throwing Exceptions
```ts
import { Provide } from '@midwayjs/core';
import { CoolCommException } from '@cool-midway/core';

@Provide()
export class UserService {
  async login(credentials) {
    const user = await this.userRepository.findOne({ username: credentials.username });
    
    if (!user) {
      throw new CoolCommException('User not found', 404);
    }
    
    if (user.password !== credentials.password) {
      throw new CoolCommException('Invalid password', 401);
    }
    
    return user;
  }
}
```

## Global Exception Handler
### Creating Exception Filter
```ts
import { Catch, ExceptionFilter, HttpStatus } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  async catch(err: Error, ctx: Context) {
    ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
    ctx.body = {
      code: 500,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    };
  }
}
```

### Registering Exception Filter
```ts
import { Configuration } from '@midwayjs/core';
import { GlobalExceptionFilter } from './filter/exception.filter';

@Configuration({
  imports: [],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  async onReady() {
    const app = this.app as any;
    app.useFilter(new GlobalExceptionFilter());
  }
}
```

## Error Codes
Cool-admin provides standard error codes:
- `RESCODE.COMMFAIL`: Common failure (400)
- `RESCODE.NOTFOUND`: Not found (404)
- `RESCODE.UNAUTH`: Unauthorized (401)
- `RESCODE.FORBIDDEN`: Forbidden (403)
- `RESCODE.SERVERERROR`: Server error (500)

## Best Practices
- Use meaningful error messages
- Provide appropriate HTTP status codes
- Log exceptions properly
- Handle exceptions at the appropriate level
- Use custom exceptions for business logic errors
- Return consistent error responses
- Hide sensitive error details in production

## Error Response Structure
```json
{
  "code": 400,
  "message": "Error message",
  "data": null
}
```

## Common Exception Scenarios
- **Validation Errors**: Invalid input data
- **Authentication Errors**: Unauthorized access
- **Authorization Errors**: Insufficient permissions
- **Database Errors**: Database operation failures
- **Business Logic Errors**: Custom business rules violations
- **External Service Errors**: Third-party service failures
