/**
 * Vertex AI 多项目负载均衡器
 * 用于突破单个项目的 QPM 限制
 */

interface ProjectConfig {
  projectId: string;
  location: string;
  credentials: any; // Service Account JSON
  qpm: number; // 每分钟配额
  currentRequests: number; // 当前分钟内的请求数
  lastResetTime: number; // 上次重置时间
  isHealthy: boolean; // 项目是否健康
  errorCount: number; // 错误计数
}

export class VertexLoadBalancer {
  private projects: ProjectConfig[] = [];
  private currentIndex = 0;
  private readonly MAX_ERRORS = 5; // 最大错误次数，超过则标记为不健康

  constructor(projectConfigs: Array<{
    projectId: string;
    location: string;
    credentials: any;
    qpm?: number;
  }>) {
    this.projects = projectConfigs.map(config => ({
      ...config,
      qpm: config.qpm || 60, // 默认 60 QPM
      currentRequests: 0,
      lastResetTime: Date.now(),
      isHealthy: true,
      errorCount: 0,
    }));
  }

  /**
   * 获取下一个可用的项目
   * 策略：轮询 + 配额检查 + 健康检查
   */
  getNextProject(): ProjectConfig | null {
    const now = Date.now();
    const healthyProjects = this.projects.filter(p => p.isHealthy);

    if (healthyProjects.length === 0) {
      console.error('❌ 所有项目都不健康！');
      // 重置所有项目的健康状态
      this.projects.forEach(p => {
        p.isHealthy = true;
        p.errorCount = 0;
      });
      return this.projects[0];
    }

    // 重置超过 1 分钟的计数器
    healthyProjects.forEach(project => {
      if (now - project.lastResetTime > 60000) {
        project.currentRequests = 0;
        project.lastResetTime = now;
      }
    });

    // 找到第一个未达到配额的项目
    for (let i = 0; i < healthyProjects.length; i++) {
      const index = (this.currentIndex + i) % healthyProjects.length;
      const project = healthyProjects[index];

      if (project.currentRequests < project.qpm) {
        this.currentIndex = (index + 1) % healthyProjects.length;
        project.currentRequests++;
        return project;
      }
    }

    // 所有项目都达到配额，返回最少请求的项目
    const leastBusyProject = healthyProjects.reduce((min, p) => 
      p.currentRequests < min.currentRequests ? p : min
    );
    leastBusyProject.currentRequests++;
    return leastBusyProject;
  }

  /**
   * 标记项目请求成功
   */
  markSuccess(projectId: string) {
    const project = this.projects.find(p => p.projectId === projectId);
    if (project) {
      project.errorCount = Math.max(0, project.errorCount - 1);
    }
  }

  /**
   * 标记项目请求失败
   */
  markFailure(projectId: string, error: any) {
    const project = this.projects.find(p => p.projectId === projectId);
    if (!project) return;

    project.errorCount++;
    
    // 如果是 429 错误，立即达到配额上限
    if (error?.status === 429 || error?.code === 429) {
      console.warn(`⚠️ 项目 ${projectId} 达到配额限制`);
      project.currentRequests = project.qpm;
    }

    // 如果错误次数过多，标记为不健康
    if (project.errorCount >= this.MAX_ERRORS) {
      console.error(`❌ 项目 ${projectId} 标记为不健康（错误次数: ${project.errorCount}）`);
      project.isHealthy = false;
      
      // 5 分钟后自动恢复
      setTimeout(() => {
        project.isHealthy = true;
        project.errorCount = 0;
        console.log(`✅ 项目 ${projectId} 恢复健康`);
      }, 5 * 60 * 1000);
    }
  }

  /**
   * 获取负载均衡统计信息
   */
  getStats() {
    return this.projects.map(p => ({
      projectId: p.projectId,
      qpm: p.qpm,
      currentRequests: p.currentRequests,
      usage: `${p.currentRequests}/${p.qpm}`,
      usagePercent: Math.round((p.currentRequests / p.qpm) * 100),
      isHealthy: p.isHealthy,
      errorCount: p.errorCount,
    }));
  }
}

