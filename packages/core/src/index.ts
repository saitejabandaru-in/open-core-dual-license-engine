import { EventEmitter } from 'events';

/**
 * @open-core/core - Advanced Open-Source Core Engine (AGPL-3.0)
 * 
 * Features:
 * - High-throughput Event Driven Architecture
 * - Middleware Processing Pipeline
 * - Real-time Prometheus Metrics Exporter
 */

export interface TaskContext {
  id: string;
  name: string;
  tenantId?: string;
  payload: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
}

export type MiddlewareFn = (ctx: TaskContext, next: () => Promise<void>) => Promise<void>;

export interface CoreMetrics {
  totalProcessed: number;
  totalFailed: number;
  avgLatencyMs: number;
  uptimeSeconds: number;
}

export class CoreEngine extends EventEmitter {
  private version: string = '2.0.0-pro';
  private middlewares: MiddlewareFn[] = [];
  private totalProcessed: number = 0;
  private totalFailed: number = 0;
  private totalLatencyMs: number = 0;
  private startTime: Date = new Date();

  constructor() {
    super();
    console.log(`[CoreEngine v${this.version}] Production Core Framework Initialized (AGPL-3.0).`);
  }

  public use(middleware: MiddlewareFn): void {
    this.middlewares.push(middleware);
  }

  public async processTask(task: { id: string; name: string; tenantId?: string; payload?: Record<string, any> }): Promise<TaskContext> {
    const startTime = Date.now();
    const ctx: TaskContext = {
      id: task.id,
      name: task.name,
      tenantId: task.tenantId || 'default',
      payload: task.payload || {},
      metadata: {},
      createdAt: new Date(),
    };

    let index = 0;
    const dispatch = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const fn = this.middlewares[index++];
        await fn(ctx, dispatch);
      }
    };

    try {
      await dispatch();
      const latency = Date.now() - startTime;
      this.totalProcessed++;
      this.totalLatencyMs += latency;
      this.emit('task:success', ctx, latency);
      return ctx;
    } catch (err: any) {
      this.totalFailed++;
      this.emit('task:error', ctx, err);
      throw err;
    }
  }

  public getMetrics(): CoreMetrics {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    const avgLatencyMs = this.totalProcessed > 0 ? Math.round(this.totalLatencyMs / this.totalProcessed) : 0;
    return {
      totalProcessed: this.totalProcessed,
      totalFailed: this.totalFailed,
      avgLatencyMs,
      uptimeSeconds,
    };
  }

  public getPrometheusMetrics(): string {
    const m = this.getMetrics();
    return `
# HELP core_tasks_processed_total Total tasks processed
# TYPE core_tasks_processed_total counter
core_tasks_processed_total ${m.totalProcessed}

# HELP core_tasks_failed_total Total tasks failed
# TYPE core_tasks_failed_total counter
core_tasks_failed_total ${m.totalFailed}

# HELP core_avg_latency_ms Average task latency in milliseconds
# TYPE core_avg_latency_ms gauge
core_avg_latency_ms ${m.avgLatencyMs}

# HELP core_uptime_seconds Engine uptime in seconds
# TYPE core_uptime_seconds counter
core_uptime_seconds ${m.uptimeSeconds}
`.trim();
  }

  public getVersion(): string {
    return this.version;
  }
}
