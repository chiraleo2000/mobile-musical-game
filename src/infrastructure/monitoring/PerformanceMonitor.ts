/**
 * PerformanceMonitor - Tracks FPS, audio latency, and memory usage
 * Requirements: 10.1, 10.4
 */

export interface PerformanceMetrics {
  fps: number;
  audioLatency: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  minFps: number;
  maxAudioLatency: number;
  maxMemoryUsage: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 60,
    audioLatency: 0,
    memoryUsage: 0,
    drawCalls: 0,
    triangles: 0,
    timestamp: Date.now(),
  };

  private thresholds: PerformanceThresholds = {
    minFps: 30,
    maxAudioLatency: 100, // ms
    maxMemoryUsage: 512 * 1024 * 1024, // 512MB
  };

  private fpsHistory: number[] = [];
  private latencyHistory: number[] = [];
  private frameCount: number = 0;
  private fpsUpdateInterval: number = 1000; // Update FPS every second
  private lastFpsUpdate: number = Date.now();

  /**
   * Update FPS tracking
   */
  public trackFrame(): void {
    const now = Date.now();
    this.frameCount++;

    // Calculate FPS every second
    if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.metrics.fps = fps;
      this.fpsHistory.push(fps);
      
      // Keep only last 60 samples (1 minute at 1 sample/second)
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }

      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    this.metrics.timestamp = now;
  }

  /**
   * Track audio latency
   */
  public trackAudioLatency(latency: number): void {
    this.metrics.audioLatency = latency;
    this.latencyHistory.push(latency);

    // Keep only last 100 samples
    if (this.latencyHistory.length > 100) {
      this.latencyHistory.shift();
    }
  }

  /**
   * Track memory usage (estimated)
   */
  public trackMemoryUsage(usage: number): void {
    this.metrics.memoryUsage = usage;
  }

  /**
   * Track render metrics
   */
  public trackRenderMetrics(drawCalls: number, triangles: number): void {
    this.metrics.drawCalls = drawCalls;
    this.metrics.triangles = triangles;
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get average FPS over last N samples
   */
  public getAverageFps(samples: number = 10): number {
    if (this.fpsHistory.length === 0) return this.metrics.fps;

    const recentSamples = this.fpsHistory.slice(-samples);
    const sum = recentSamples.reduce((acc, fps) => acc + fps, 0);
    return Math.round(sum / recentSamples.length);
  }

  /**
   * Get average audio latency over last N samples
   */
  public getAverageLatency(samples: number = 10): number {
    if (this.latencyHistory.length === 0) return this.metrics.audioLatency;

    const recentSamples = this.latencyHistory.slice(-samples);
    const sum = recentSamples.reduce((acc, lat) => acc + lat, 0);
    return Math.round(sum / recentSamples.length);
  }

  /**
   * Check if performance is below thresholds
   */
  public isPerformanceLow(): boolean {
    const avgFps = this.getAverageFps(5);
    return avgFps < this.thresholds.minFps;
  }

  /**
   * Check if audio latency is too high
   */
  public isLatencyHigh(): boolean {
    const avgLatency = this.getAverageLatency(5);
    return avgLatency > this.thresholds.maxAudioLatency;
  }

  /**
   * Check if memory usage is too high
   */
  public isMemoryHigh(): boolean {
    return this.metrics.memoryUsage > this.thresholds.maxMemoryUsage;
  }

  /**
   * Get performance warnings
   */
  public getWarnings(): string[] {
    const warnings: string[] = [];

    if (this.isPerformanceLow()) {
      warnings.push(`Low FPS: ${this.getAverageFps(5)} (target: ${this.thresholds.minFps}+)`);
    }

    if (this.isLatencyHigh()) {
      warnings.push(`High audio latency: ${this.getAverageLatency(5)}ms (target: <${this.thresholds.maxAudioLatency}ms)`);
    }

    if (this.isMemoryHigh()) {
      const memoryMB = Math.round(this.metrics.memoryUsage / (1024 * 1024));
      const maxMemoryMB = Math.round(this.thresholds.maxMemoryUsage / (1024 * 1024));
      warnings.push(`High memory usage: ${memoryMB}MB (limit: ${maxMemoryMB}MB)`);
    }

    return warnings;
  }

  /**
   * Log performance metrics for debugging
   */
  public logMetrics(): void {
    console.log('Performance Metrics:', {
      fps: this.metrics.fps,
      avgFps: this.getAverageFps(),
      audioLatency: this.metrics.audioLatency,
      avgLatency: this.getAverageLatency(),
      memoryMB: Math.round(this.metrics.memoryUsage / (1024 * 1024)),
      drawCalls: this.metrics.drawCalls,
      triangles: this.metrics.triangles,
      warnings: this.getWarnings(),
    });
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.metrics = {
      fps: 60,
      audioLatency: 0,
      memoryUsage: 0,
      drawCalls: 0,
      triangles: 0,
      timestamp: Date.now(),
    };
    this.fpsHistory = [];
    this.latencyHistory = [];
    this.frameCount = 0;
    this.lastFpsUpdate = Date.now();
  }

  /**
   * Set custom thresholds
   */
  public setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
}
