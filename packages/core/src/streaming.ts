import { EventEmitter } from 'events';

/**
 * Real-Time Token Streaming & Server-Sent Events (SSE) Engine
 */

export interface StreamToken {
  agentName: string;
  token: string;
  done: boolean;
  timestamp: number;
}

export class AgentStreamEmitter extends EventEmitter {
  public emitToken(agentName: string, token: string): void {
    const chunk: StreamToken = {
      agentName,
      token,
      done: false,
      timestamp: Date.now(),
    };
    this.emit('token', chunk);
  }

  public emitDone(agentName: string): void {
    const chunk: StreamToken = {
      agentName,
      token: '',
      done: true,
      timestamp: Date.now(),
    };
    this.emit('token', chunk);
    this.emit('done', agentName);
  }

  public formatSSE(chunk: StreamToken): string {
    return `data: ${JSON.stringify(chunk)}\n\n`;
  }
}
