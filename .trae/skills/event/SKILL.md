---
name: "event"
description: "Handles event-driven programming for cool-admin projects. Invoke when user needs to implement event listeners, publish events, or create event-based architectures."
---

# Event Management Skill

## Overview
This skill helps you implement event-driven programming in cool-admin projects using MidwayJS event system.

## Event Types
- **System Events**: Framework-level events
- **Business Events**: Application-specific events
- **Custom Events**: User-defined events

## Event Listeners
### Creating Listeners
```ts
import { Subscribe, Provide } from '@midwayjs/core';
import { CoolEventManager } from '@cool-midway/core';

@Provide()
export class ModuleEventListener {
  @Subscribe('user.registered')
  async handleUserRegistered(eventData: any) {
    console.log('User registered:', eventData);
    // Handle event
  }

  @Subscribe('order.created')
  async handleOrderCreated(eventData: any) {
    console.log('Order created:', eventData);
    // Handle event
  }
}
```

## Event Publishing
### Publishing Events
```ts
import { Inject } from '@midwayjs/core';
import { CoolEventManager } from '@cool-midway/core';

@Provide()
export class UserService {
  @Inject()
  coolEventManager: CoolEventManager;

  async register(userData) {
    // Register user
    const user = await this.userRepository.create(userData);

    // Publish event
    await this.coolEventManager.publish('user.registered', {
      userId: user.id,
      email: user.email,
    });

    return user;
  }
}
```

## Event Flow
1. **Event Creation**: Business logic generates an event
2. **Event Publishing**: Event is published to the event system
3. **Event Subscription**: Listeners receive and process the event
4. **Event Handling**: Business logic is executed in listeners

## Best Practices
- Use events for decoupling components
- Keep event handlers lightweight
- Use meaningful event names
- Document event structures
- Handle errors in event listeners
- Use async/await for event handlers

## Common Use Cases
- User registration and authentication
- Order processing and fulfillment
- Notification systems
- Logging and auditing
- Data synchronization
- Workflow automation

## Event Patterns
- **Publish/Subscribe**: One-to-many event distribution
- **Event Sourcing**: Persisting state changes as events
- **CQRS**: Command-Query Responsibility Segregation
- **Domain Events**: Capturing domain-specific events
