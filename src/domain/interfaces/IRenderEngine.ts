/**
 * Render Engine Interface
 */

import { Model3DReference, Vector3 } from '../entities/Instrument';
import { Gesture } from '../entities/Touch';
import { QualityLevel, PerformanceMetrics } from '../entities/AppState';

export interface IRenderEngine {
  initialize(glContext: WebGLRenderingContext): void;
  loadModel(model: Model3DReference): Promise<void>;
  render(deltaTime: number): void;
  setCamera(position: Vector3, target: Vector3): void;
  handleGesture(gesture: Gesture): void;
  setQualityLevel(level: QualityLevel): void;
  getPerformanceMetrics(): PerformanceMetrics;
  dispose(): void;
}
