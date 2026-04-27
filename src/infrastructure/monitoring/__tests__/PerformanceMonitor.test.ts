/**
 * PerformanceMonitor Tests
 */

import { PerformanceMonitor } from '../PerformanceMonitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('FPS Tracking', () => {
    it('should track FPS over time', () => {
      const startTime = Date.now();
      jest.setSystemTime(startTime);

      // Simulate 60 frames over 1 second
      for (let i = 0; i < 60; i++) {
        monitor.trackFrame();
        jest.setSystemTime(startTime + (i + 1) * 16.67);
      }

      jest.setSystemTime(startTime + 1000);
      monitor.trackFrame();

      const metrics = monitor.getMetrics();
      expect(metrics.fps).toBeGreaterThan(0);
    });

    it('should calculate average FPS', () => {
      const startTime = Date.now();
      jest.setSystemTime(startTime);

      // Add some FPS samples
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 60; j++) {
          monitor.trackFrame();
          jest.setSystemTime(startTime + i * 1000 + j * 16.67);
        }
        jest.setSystemTime(startTime + (i + 1) * 1000);
      }

      const avgFps = monitor.getAverageFps(5);
      expect(avgFps).toBeGreaterThan(0);
    });

    it('should detect low FPS', () => {
      monitor.setThresholds({ minFps: 30 });
      const startTime = Date.now();
      jest.setSystemTime(startTime);

      // Simulate low FPS (20fps)
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 20; j++) {
          monitor.trackFrame();
          jest.setSystemTime(startTime + i * 1000 + j * 50);
        }
        jest.setSystemTime(startTime + (i + 1) * 1000);
      }

      expect(monitor.isPerformanceLow()).toBe(true);
      const warnings = monitor.getWarnings();
      expect(warnings.some(w => w.includes('Low FPS'))).toBe(true);
    });
  });

  describe('Audio Latency Tracking', () => {
    it('should track audio latency', () => {
      monitor.trackAudioLatency(50);
      
      const metrics = monitor.getMetrics();
      expect(metrics.audioLatency).toBe(50);
    });

    it('should calculate average latency', () => {
      const latencies = [40, 50, 60, 45, 55];
      latencies.forEach(lat => monitor.trackAudioLatency(lat));

      const avgLatency = monitor.getAverageLatency(5);
      expect(avgLatency).toBe(50);
    });

    it('should detect high latency', () => {
      monitor.setThresholds({ maxAudioLatency: 100 });

      // Add high latency samples
      for (let i = 0; i < 10; i++) {
        monitor.trackAudioLatency(150);
      }

      expect(monitor.isLatencyHigh()).toBe(true);
      const warnings = monitor.getWarnings();
      expect(warnings.some(w => w.includes('High audio latency'))).toBe(true);
    });
  });

  describe('Memory Tracking', () => {
    it('should track memory usage', () => {
      const memoryUsage = 256 * 1024 * 1024; // 256MB
      monitor.trackMemoryUsage(memoryUsage);

      const metrics = monitor.getMetrics();
      expect(metrics.memoryUsage).toBe(memoryUsage);
    });

    it('should detect high memory usage', () => {
      monitor.setThresholds({ maxMemoryUsage: 512 * 1024 * 1024 }); // 512MB

      const highMemory = 600 * 1024 * 1024; // 600MB
      monitor.trackMemoryUsage(highMemory);

      expect(monitor.isMemoryHigh()).toBe(true);
      const warnings = monitor.getWarnings();
      expect(warnings.some(w => w.includes('High memory usage'))).toBe(true);
    });
  });

  describe('Render Metrics', () => {
    it('should track draw calls and triangles', () => {
      monitor.trackRenderMetrics(50, 10000);

      const metrics = monitor.getMetrics();
      expect(metrics.drawCalls).toBe(50);
      expect(metrics.triangles).toBe(10000);
    });
  });

  describe('Performance Warnings', () => {
    it('should return empty warnings when performance is good', () => {
      monitor.trackFrame();
      monitor.trackAudioLatency(50);
      monitor.trackMemoryUsage(100 * 1024 * 1024);

      const warnings = monitor.getWarnings();
      expect(warnings).toHaveLength(0);
    });

    it('should return multiple warnings when performance is poor', () => {
      monitor.setThresholds({
        minFps: 30,
        maxAudioLatency: 100,
        maxMemoryUsage: 512 * 1024 * 1024,
      });

      const startTime = Date.now();
      jest.setSystemTime(startTime);

      // Simulate poor performance
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 20; j++) {
          monitor.trackFrame();
          jest.setSystemTime(startTime + i * 1000 + j * 50);
        }
        jest.setSystemTime(startTime + (i + 1) * 1000);
        monitor.trackAudioLatency(150);
      }
      monitor.trackMemoryUsage(600 * 1024 * 1024);

      const warnings = monitor.getWarnings();
      expect(warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Reset', () => {
    it('should reset all metrics', () => {
      monitor.trackFrame();
      monitor.trackAudioLatency(50);
      monitor.trackMemoryUsage(100 * 1024 * 1024);
      monitor.trackRenderMetrics(50, 10000);

      monitor.reset();

      const metrics = monitor.getMetrics();
      expect(metrics.fps).toBe(60);
      expect(metrics.audioLatency).toBe(0);
      expect(metrics.memoryUsage).toBe(0);
      expect(metrics.drawCalls).toBe(0);
      expect(metrics.triangles).toBe(0);
    });
  });

  describe('Logging', () => {
    it('should log metrics without errors', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      monitor.trackFrame();
      monitor.trackAudioLatency(50);
      monitor.logMetrics();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Performance Metrics:',
        expect.objectContaining({
          fps: expect.any(Number),
          avgFps: expect.any(Number),
          audioLatency: expect.any(Number),
        })
      );

      consoleSpy.mockRestore();
    });
  });
});
