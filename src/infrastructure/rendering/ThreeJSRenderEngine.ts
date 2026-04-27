/**
 * Three.js Render Engine Implementation
 * 
 * Provides 3D rendering capabilities using Three.js with expo-gl integration.
 * Handles model loading, lighting, camera control, and performance optimization.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { IRenderEngine } from '@domain/interfaces/IRenderEngine';
import { Model3DReference, Vector3, LODLevel } from '@domain/entities/Instrument';
import { Gesture } from '@domain/entities/Touch';
import { QualityLevel, PerformanceMetrics } from '@domain/entities/AppState';
import { AdaptiveLODStrategy } from './AdaptiveLODStrategy';

export class ThreeJSRenderEngine implements IRenderEngine {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private currentModel: THREE.Group | null = null;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 60;
  private qualityLevel: QualityLevel = 'high';
  
  // Lighting
  private ambientLight: THREE.AmbientLight | null = null;
  private directionalLight: THREE.DirectionalLight | null = null;
  private fillLight: THREE.DirectionalLight | null = null;
  
  // Performance tracking
  private drawCalls: number = 0;
  private triangles: number = 0;
  
  // LOD Strategy
  private lodStrategy!: AdaptiveLODStrategy;
  private currentModelReference: Model3DReference | null = null;
  
  // Camera animation for smooth transitions
  private targetCameraPosition: THREE.Vector3 = new THREE.Vector3(0, 2, 5);
  private targetModelRotation: THREE.Euler = new THREE.Euler(0, 0, 0);
  private cameraLerpFactor: number = 0.1; // Smoothing factor (0-1, lower = smoother)
  private rotationLerpFactor: number = 0.15; // Smoothing factor for rotation

  /**
   * Initialize the render engine with a WebGL context
   */
  initialize(glContext: WebGLRenderingContext): void {
    // Initialize LOD strategy with callback
    this.lodStrategy = new AdaptiveLODStrategy(this.handleLODChange.bind(this));
    
    // Initialize Three.js renderer with expo-gl context
    this.renderer = new THREE.WebGLRenderer({
      context: glContext as any,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    
    this.renderer.setSize(
      glContext.drawingBufferWidth,
      glContext.drawingBufferHeight
    );
    this.renderer.setClearColor(0x000000, 0);
    
    // Initialize scene
    this.scene = new THREE.Scene();
    
    // Initialize camera with 45° FOV, 0.1-1000 near/far planes
    const aspectRatio = 
      glContext.drawingBufferWidth / glContext.drawingBufferHeight;
    this.camera = new THREE.PerspectiveCamera(
      45,  // FOV
      aspectRatio,
      0.1, // Near plane
      1000 // Far plane
    );
    
    // Set default camera position
    this.camera.position.set(0, 2, 5);
    this.camera.lookAt(0, 0, 0);
    
    // Initialize target positions for smooth transitions
    this.targetCameraPosition.set(0, 2, 5);
    
    // Setup lighting
    this.setupLighting();
    
    // Start render loop
    this.startRenderLoop();
  }

  /**
   * Setup three-point lighting system
   */
  private setupLighting(): void {
    if (!this.scene) return;
    
    // Ambient light for base illumination (50% intensity)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);
    
    // Directional light for highlights (80% intensity)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(5, 10, 7.5);
    this.directionalLight.castShadow = false; // Disable shadows for performance
    this.scene.add(this.directionalLight);
    
    // Fill light to reduce harsh shadows (30% intensity)
    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    this.fillLight.position.set(-5, 0, -5);
    this.scene.add(this.fillLight);
  }

  /**
   * Load a 3D model (GLTF/GLB/OBJ)
   */
  async loadModel(model: Model3DReference): Promise<void> {
    if (!this.scene) {
      throw new Error('Render engine not initialized');
    }
    
    // Store model reference for LOD switching
    this.currentModelReference = model;
    
    // Set up LOD levels if available
    if (model.lodLevels && model.lodLevels.length > 0) {
      this.lodStrategy.setLODLevels(model.lodLevels);
    } else {
      // Reset to default LOD levels if none provided
      this.lodStrategy.reset();
    }
    
    // Load the highest quality model initially
    const lodLevel = this.lodStrategy.getCurrentLOD();
    const modelPath = lodLevel ? lodLevel.filePath : model.filePath;
    
    await this.loadModelAtPath(modelPath, model);
  }
  
  /**
   * Load a model from a specific path
   */
  private async loadModelAtPath(filePath: string, model: Model3DReference): Promise<void> {
    if (!this.scene) {
      throw new Error('Render engine not initialized');
    }
    
    // Remove previous model if exists
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
      this.disposeModel(this.currentModel);
      this.currentModel = null;
    }
    
    // Load model based on format
    const loader = this.getLoader(model.format);
    const loadedModel = await this.loadModelAsync(loader, filePath);
    
    // Apply optimizations
    this.optimizeModel(loadedModel);
    
    // Apply default transformations
    loadedModel.scale.set(
      model.defaultScale.x,
      model.defaultScale.y,
      model.defaultScale.z
    );
    loadedModel.rotation.set(
      model.defaultRotation.x,
      model.defaultRotation.y,
      model.defaultRotation.z
    );
    
    // Center model
    this.centerModel(loadedModel);
    
    // Add to scene
    this.currentModel = loadedModel;
    this.scene.add(loadedModel);
    
    // Initialize target rotation for smooth transitions
    this.targetModelRotation.set(
      loadedModel.rotation.x,
      loadedModel.rotation.y,
      loadedModel.rotation.z
    );
  }
  
  /**
   * Handle LOD level change
   */
  private async handleLODChange(lodLevel: LODLevel, _index: number): Promise<void> {
    if (!this.currentModelReference) {
      return;
    }
    
    try {
      // Load the new LOD model
      await this.loadModelAtPath(lodLevel.filePath, this.currentModelReference);
    } catch (error) {
      console.error('Failed to switch LOD level:', error);
      // Continue with current model on error
    }
  }

  /**
   * Get appropriate loader for model format
   */
  private getLoader(format: string): GLTFLoader | OBJLoader {
    switch (format) {
      case 'gltf':
      case 'glb':
        return new GLTFLoader();
      case 'obj':
        return new OBJLoader();
      default:
        throw new Error(`Unsupported model format: ${format}`);
    }
  }

  /**
   * Load model asynchronously
   */
  private loadModelAsync(
    loader: GLTFLoader | OBJLoader,
    filePath: string
  ): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      loader.load(
        filePath,
        (result: any) => {
          // Handle GLTF vs OBJ result structure
          const model = result.scene || result;
          resolve(model);
        },
        undefined,
        (error: any) => {
          reject(new Error(`Failed to load model: ${error.message}`));
        }
      );
    });
  }

  /**
   * Optimize model for performance
   */
  private optimizeModel(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enable frustum culling
        child.frustumCulled = true;
        
        // Optimize geometry
        if (child.geometry) {
          child.geometry.computeBoundingSphere();
          child.geometry.computeBoundingBox();
        }
        
        // Optimize materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.Material) {
                mat.precision = 'mediump';
              }
            });
          } else if (child.material instanceof THREE.Material) {
            child.material.precision = 'mediump';
          }
        }
      }
    });
  }

  /**
   * Center model in the scene
   */
  private centerModel(model: THREE.Group): void {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
  }

  /**
   * Dispose model and free resources
   */
  private disposeModel(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  /**
   * Start the render loop
   */
  private startRenderLoop(): void {
    this.lastFrameTime = performance.now();
    this.renderFrame();
  }

  /**
   * Render a single frame
   */
  private renderFrame = (): void => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;
    
    // Calculate FPS
    this.frameCount++;
    if (this.frameCount >= 60) {
      this.fps = Math.round(1 / deltaTime);
      this.frameCount = 0;
    }
    
    // Render the scene
    this.render(deltaTime);
    
    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.renderFrame);
  };

  /**
   * Render the scene with delta time
   */
  render(_deltaTime: number): void {
    if (!this.scene || !this.camera || !this.renderer) {
      return;
    }
    
    // Apply smooth camera transitions
    this.applySmoothTransitions();
    
    // Update performance metrics
    this.updatePerformanceMetrics();
    
    // Update LOD based on FPS (target 30 FPS)
    this.lodStrategy.updateLOD(this.fps, 30);
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
    
    // Flush GL commands for expo-gl
    const gl = this.renderer.getContext() as any;
    if (gl.endFrameEXP) {
      gl.endFrameEXP();
    }
  }
  
  /**
   * Apply smooth transitions to camera and model using linear interpolation
   */
  private applySmoothTransitions(): void {
    if (!this.camera || !this.currentModel) {
      return;
    }
    
    // Smoothly interpolate camera position
    this.camera.position.lerp(this.targetCameraPosition, this.cameraLerpFactor);
    
    // Smoothly interpolate model rotation
    this.currentModel.rotation.x += 
      (this.targetModelRotation.x - this.currentModel.rotation.x) * this.rotationLerpFactor;
    this.currentModel.rotation.y += 
      (this.targetModelRotation.y - this.currentModel.rotation.y) * this.rotationLerpFactor;
    this.currentModel.rotation.z += 
      (this.targetModelRotation.z - this.currentModel.rotation.z) * this.rotationLerpFactor;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    if (!this.renderer || !this.scene) {
      return;
    }
    
    // Count draw calls and triangles
    this.drawCalls = 0;
    this.triangles = 0;
    
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        this.drawCalls++;
        if (object.geometry) {
          const positions = object.geometry.attributes.position;
          if (positions) {
            this.triangles += positions.count / 3;
          }
        }
      }
    });
  }

  /**
   * Set camera position and target
   * Updates target position for smooth transition
   */
  setCamera(position: Vector3, target: Vector3): void {
    if (!this.camera) {
      throw new Error('Camera not initialized');
    }
    
    // Update target camera position for smooth transition
    this.targetCameraPosition.set(position.x, position.y, position.z);
    
    // Update camera look-at target
    this.camera.lookAt(target.x, target.y, target.z);
    this.camera.updateProjectionMatrix();
  }

  /**
   * Handle gesture input for camera control
   */
  handleGesture(gesture: Gesture): void {
    if (!this.camera || !this.currentModel) {
      return;
    }
    
    switch (gesture.type) {
      case 'drag':
        this.handlePanGesture(gesture);
        break;
      case 'pinch':
        this.handlePinchZoomGesture(gesture);
        break;
      case 'rotate':
        this.handleRotateGesture(gesture);
        break;
    }
  }

  /**
   * Handle pan gesture for model rotation
   * Allows user to rotate the 3D model by dragging
   */
  private handlePanGesture(gesture: Gesture): void {
    if (!this.currentModel || !gesture.delta) {
      return;
    }
    
    // Rotation sensitivity - adjust for natural feel
    const rotationSpeed = 0.01;
    
    // Update target rotation based on drag delta
    // Horizontal drag rotates around Y axis (left-right)
    this.targetModelRotation.y += gesture.delta.x * rotationSpeed;
    
    // Vertical drag rotates around X axis (up-down)
    this.targetModelRotation.x += gesture.delta.y * rotationSpeed;
    
    // Clamp X rotation to prevent flipping upside down
    this.targetModelRotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.targetModelRotation.x)
    );
  }

  /**
   * Handle pinch-to-zoom gesture
   * Allows user to zoom in/out by pinching
   */
  private handlePinchZoomGesture(gesture: Gesture): void {
    if (!this.camera || !gesture.scale) {
      return;
    }
    
    // Zoom sensitivity - adjust for natural feel
    const zoomSpeed = 2.0;
    
    // Calculate zoom delta from pinch scale
    // scale > 1 means pinch out (zoom in)
    // scale < 1 means pinch in (zoom out)
    const zoomDelta = (1 - gesture.scale) * zoomSpeed;
    
    // Update target camera Z position
    // Clamp between min (2) and max (10) distance
    const newZ = this.targetCameraPosition.z + zoomDelta;
    this.targetCameraPosition.z = Math.max(2, Math.min(10, newZ));
  }

  /**
   * Handle rotate gesture (two-finger rotation)
   */
  private handleRotateGesture(gesture: Gesture): void {
    if (!this.currentModel || !gesture.rotation) {
      return;
    }
    
    // Apply rotation around Y axis
    this.targetModelRotation.y += gesture.rotation;
  }

  /**
   * Set quality level for rendering
   */
  setQualityLevel(level: QualityLevel): void {
    this.qualityLevel = level;
    
    if (!this.renderer) {
      return;
    }
    
    // Adjust renderer settings based on quality level
    switch (this.qualityLevel) {
      case 'low':
        this.renderer.setPixelRatio(1);
        if (this.renderer.shadowMap) {
          this.renderer.shadowMap.enabled = false;
        }
        break;
      case 'medium':
        this.renderer.setPixelRatio(1.5);
        if (this.renderer.shadowMap) {
          this.renderer.shadowMap.enabled = false;
        }
        break;
      case 'high':
        this.renderer.setPixelRatio(2);
        if (this.renderer.shadowMap) {
          this.renderer.shadowMap.enabled = false;
        }
        break;
      case 'auto':
        // Auto-adjust based on performance
        const pixelRatio = this.fps >= 30 ? 2 : this.fps >= 20 ? 1.5 : 1;
        this.renderer.setPixelRatio(pixelRatio);
        break;
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      drawCalls: this.drawCalls,
      triangles: Math.round(this.triangles),
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Estimate memory usage (rough approximation)
   */
  private estimateMemoryUsage(): number {
    if (!this.renderer) {
      return 0;
    }
    
    const info = this.renderer.info;
    // Rough estimate: geometries + textures in MB
    const geometryMemory = info.memory.geometries * 0.1; // ~100KB per geometry
    const textureMemory = info.memory.textures * 0.5; // ~500KB per texture
    return geometryMemory + textureMemory;
  }

  /**
   * Dispose and cleanup all resources
   */
  dispose(): void {
    // Stop render loop
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Dispose current model
    if (this.currentModel && this.scene) {
      this.scene.remove(this.currentModel);
      this.disposeModel(this.currentModel);
      this.currentModel = null;
    }
    
    // Dispose lights
    if (this.ambientLight && this.scene) {
      this.scene.remove(this.ambientLight);
      this.ambientLight = null;
    }
    if (this.directionalLight && this.scene) {
      this.scene.remove(this.directionalLight);
      this.directionalLight = null;
    }
    if (this.fillLight && this.scene) {
      this.scene.remove(this.fillLight);
      this.fillLight = null;
    }
    
    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    
    // Clear scene
    this.scene = null;
    this.camera = null;
  }
}
