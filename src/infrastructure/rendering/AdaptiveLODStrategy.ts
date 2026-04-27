/**
 * Adaptive Level of Detail (LOD) Strategy
 * 
 * Automatically switches between different quality models based on FPS performance.
 * Maintains smooth performance by reducing polygon count when FPS drops below target.
 */

import { LODLevel } from '@domain/entities/Instrument';

export interface LODStrategy {
  /**
   * Update LOD level based on current performance
   * @param fps Current frames per second
   * @param targetFPS Target frames per second (typically 30)
   */
  updateLOD(fps: number, targetFPS: number): void;
  
  /**
   * Get the current LOD level index
   */
  getCurrentLODIndex(): number;
  
  /**
   * Get the current LOD level
   */
  getCurrentLOD(): LODLevel | null;
  
  /**
   * Set LOD levels for the current model
   */
  setLODLevels(levels: LODLevel[]): void;
  
  /**
   * Reset to highest quality LOD
   */
  reset(): void;
}

export class AdaptiveLODStrategy implements LODStrategy {
  private currentLODIndex: number = 2; // Start at high quality
  private lodLevels: LODLevel[] = [];
  private lodChangeCallback: ((lodLevel: LODLevel, index: number) => void) | null = null;
  private framesSinceLODChange: number = 0;
  private readonly MIN_FRAMES_BETWEEN_CHANGES = 60; // Wait 60 frames (~1 second at 60fps) between LOD changes
  
  /**
   * Default LOD levels based on polygon count
   * Low: 5000 polygons, Medium: 15000, High: 50000
   */
  private readonly DEFAULT_LOD_LEVELS: LODLevel[] = [
    { distance: 0, polygonCount: 5000, filePath: 'model-low.glb' },
    { distance: 0, polygonCount: 15000, filePath: 'model-medium.glb' },
    { distance: 0, polygonCount: 50000, filePath: 'model-high.glb' },
  ];

  constructor(lodChangeCallback?: (lodLevel: LODLevel, index: number) => void) {
    this.lodLevels = [...this.DEFAULT_LOD_LEVELS];
    this.lodChangeCallback = lodChangeCallback || null;
  }

  /**
   * Set LOD levels for the current model
   */
  setLODLevels(levels: LODLevel[]): void {
    if (levels.length === 0) {
      throw new Error('LOD levels array cannot be empty');
    }
    
    // Sort LOD levels by polygon count (ascending)
    this.lodLevels = [...levels].sort((a, b) => a.polygonCount - b.polygonCount);
    
    // Reset to highest quality
    this.currentLODIndex = this.lodLevels.length - 1;
    this.framesSinceLODChange = 0;
  }

  /**
   * Update LOD level based on current FPS performance
   * Automatically reduces quality when FPS drops below 30
   */
  updateLOD(fps: number, targetFPS: number = 30): void {
    if (this.lodLevels.length === 0) {
      return;
    }
    
    // Increment frame counter
    this.framesSinceLODChange++;
    
    // Don't change LOD too frequently to avoid thrashing
    if (this.framesSinceLODChange < this.MIN_FRAMES_BETWEEN_CHANGES) {
      return;
    }
    
    const previousLODIndex = this.currentLODIndex;
    
    // Performance is poor, reduce quality
    if (fps < targetFPS - 5 && this.currentLODIndex > 0) {
      this.currentLODIndex--;
      this.onLODChanged(previousLODIndex);
    }
    // Performance is good, increase quality
    else if (fps > targetFPS + 5 && this.currentLODIndex < this.lodLevels.length - 1) {
      this.currentLODIndex++;
      this.onLODChanged(previousLODIndex);
    }
  }

  /**
   * Handle LOD level change
   */
  private onLODChanged(previousIndex: number): void {
    if (previousIndex === this.currentLODIndex) {
      return;
    }
    
    // Reset frame counter
    this.framesSinceLODChange = 0;
    
    // Notify callback if registered
    if (this.lodChangeCallback) {
      const currentLOD = this.lodLevels[this.currentLODIndex];
      this.lodChangeCallback(currentLOD, this.currentLODIndex);
    }
  }

  /**
   * Get the current LOD level index
   */
  getCurrentLODIndex(): number {
    return this.currentLODIndex;
  }

  /**
   * Get the current LOD level
   */
  getCurrentLOD(): LODLevel | null {
    if (this.lodLevels.length === 0) {
      return null;
    }
    return this.lodLevels[this.currentLODIndex];
  }

  /**
   * Reset to highest quality LOD
   */
  reset(): void {
    this.currentLODIndex = this.lodLevels.length > 0 ? this.lodLevels.length - 1 : 0;
    this.framesSinceLODChange = 0;
  }

  /**
   * Set callback for LOD changes
   */
  setLODChangeCallback(callback: (lodLevel: LODLevel, index: number) => void): void {
    this.lodChangeCallback = callback;
  }

  /**
   * Get all LOD levels
   */
  getLODLevels(): LODLevel[] {
    return [...this.lodLevels];
  }
}
