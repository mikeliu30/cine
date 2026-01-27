// Vertex AI 配额管理器
// 用于处理 QPM（每分钟请求数）限制

interface QueueItem {
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class VertexAIRateLimiter {
  private queue: QueueItem[] = [];
  private requestCount = 0;
  private lastResetTime = Date.now();
  private processing = false;
  
  // 配置
  private readonly MAX_QPM = 50; // 设置为 50，留 10 个缓冲（默认配额 60）
  private readonly MAX_CONCURRENT = 10; // 最大并发数
  private activeRequests = 0;

  constructor() {
    // 每分钟重置计数器
    setInterval(() => {
      const now = Date.now();
      if (now - this.lastResetTime >= 60000) {
        console.log(`[Rate Limiter] Reset: ${this.requestCount} requests in last minute`);
        this.requestCount = 0;
        this.lastResetTime = now;
      }
    }, 1000);
  }

  // 添加请求到队列
  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        execute: fn,
        resolve,
        reject,
      });

      console.log(`[Rate Limiter] Queue size: ${this.queue.length}, Active: ${this.activeRequests}`);
      
      // 尝试处理队列
      this.processQueue();
    });
  }

  // 处理队列
  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      // 检查是否超过 QPM 限制
      if (this.requestCount >= this.MAX_QPM) {
        const waitTime = 60000 - (Date.now() - this.lastResetTime);
        console.warn(`[Rate Limiter] ⚠️ QPM limit reached (${this.requestCount}/${this.MAX_QPM}), waiting ${Math.ceil(waitTime / 1000)}s`);
        await this.sleep(waitTime);
        continue;
      }

      // 检查是否超过并发限制
      if (this.activeRequests >= this.MAX_CONCURRENT) {
        await this.sleep(100); // 等待 100ms 后重试
        continue;
      }

      // 取出队列中的第一个请求
      const item = this.queue.shift();
      if (!item) break;

      // 执行请求
      this.activeRequests++;
      this.requestCount++;
      
      console.log(`[Rate Limiter] Executing request (${this.requestCount}/${this.MAX_QPM} QPM, ${this.activeRequests}/${this.MAX_CONCURRENT} concurrent)`);

      // 异步执行，不阻塞队列处理
      item.execute()
        .then(item.resolve)
        .catch(item.reject)
        .finally(() => {
          this.activeRequests--;
        });

      // 短暂延迟，避免瞬间发送太多请求
      await this.sleep(100);
    }

    this.processing = false;
  }

  // 获取队列状态
  getStatus() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      requestCount: this.requestCount,
      maxQPM: this.MAX_QPM,
      utilizationPercent: Math.round((this.requestCount / this.MAX_QPM) * 100),
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 全局单例
export const rateLimiter = new VertexAIRateLimiter();

