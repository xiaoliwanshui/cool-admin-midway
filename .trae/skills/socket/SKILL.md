---
name: "socket"
description: "Handles WebSocket communication for cool-admin projects. Invoke when user needs to implement real-time communication, WebSocket servers, or socket-based features."
---

# Socket Communication Skill

## Overview
This skill helps you implement WebSocket communication in cool-admin projects for real-time features and bidirectional communication.

## Socket Setup
### Installation
```bash
npm install @midwayjs/socketio
```

### Configuration
```ts
import { Configuration } from '@midwayjs/core';
import * as socketio from '@midwayjs/socketio';

@Configuration({
  imports: [socketio],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {}
```

## Socket Controller
### Creating Socket Controller
```ts
import { SocketController, OnConnect, OnDisconnect, OnMessage, SocketId } from '@midwayjs/socketio';

@SocketController()
export class ChatSocketController {
  @OnConnect()
  async onConnection(@SocketId() id: string) {
    console.log('Client connected:', id);
  }

  @OnDisconnect()
  async onDisconnect(@SocketId() id: string) {
    console.log('Client disconnected:', id);
  }

  @OnMessage('chat')
  async onChat(@SocketId() id: string, data: any) {
    console.log('Chat message:', data);
    // Broadcast message to all clients
    return {
      message: data.message,
      sender: id,
      time: new Date().toISOString(),
    };
  }
}
```

## Socket Events
- **OnConnect**: Client connects
- **OnDisconnect**: Client disconnects
- **OnMessage**: Receive message from client
- **OnEvent**: Custom event handling

## Socket Operations
- **Emit**: Send message to specific client
- **Broadcast**: Send message to all clients
- **Join Room**: Join a room
- **Leave Room**: Leave a room
- **Room Broadcast**: Send message to room members

## Best Practices
- Use meaningful event names
- Handle connection lifecycle events
- Implement authentication for sockets
- Use rooms for targeted communication
- Handle errors properly
- Monitor socket connections
- Set appropriate timeouts

## Common Use Cases
- Real-time chat applications
- Live notifications
- Real-time data updates
- Multiplayer games
- Collaborative tools
- Live dashboards
- IoT device communication

## Security Considerations
- Implement socket authentication
- Validate incoming messages
- Rate limit socket connections
- Use secure WebSocket (wss://)
- Handle connection hijacking
- Monitor for unusual activity
