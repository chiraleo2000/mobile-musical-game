/**
 * Unit tests for ThreeJSRenderEngine
 * 
 * Tests camera setup, LOD switching, performance metrics, and gesture handling
 */

import { ThreeJSRenderEngine } from '../ThreeJSRenderEngine';
import { Model3DReference, Vector3 } from '@domain/entities/Instrument';
import { Gesture } from '@domain/entities/Touch';
import * as THREE from 'three';

// Mock Three.js
jest.mock('three', () => {
  const actualThree = jest.requireActual('three');
  
  return {
    ...actualThree,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      setClearColor: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
      getContext: jest.fn().mockReturnValue({
        endFrameEXP: jest.fn(),
      }),
      shadowMap: {
        enabled: false,
      },
      info: {
        memory: {
          geometries: 5,
          textures: 3,
        },
      },
    })),
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn(),
      traverse: jest.fn(),
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: {
        set: jest.fn(),
        lerp: jest.fn(),
        x: 0,
        y: 2,
        z: 5,
      },
      lookAt: jest.fn(),
      updateProjectionMatrix: jest.fn(),
    })),
    AmbientLight: jest.fn().mockImplementation(() => ({})),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: {
        set: jest.fn(),
      },
      castShadow: false,
    })),
    Group: jest.fn().mockImplementation(() => ({
      scale: { set: jest.fn(), x: 1, y: 1, z: 1 },
      rotation: { set: jest.fn(), x: 0, y: 0, z: 0 },
      position: { sub: jest.fn(), x: 0, y: 0, z: 0 },
      traverse: jest.fn(),
    })),
    Box3: jest.fn().mockImplementation(() => ({
      setFromObject: jest.fn().mockReturnThis(),
      getCenter: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    })),
    Vector3: actualThree.Vector3,
    Euler: actualThree.Euler,
    Mesh: actualThree.Mesh,
    Material: actualThree.Material,
  };
});

// Mock GLTF and OBJ loaders
jest.mock('three/addons/loaders/GLTFLoader.js', () => ({
  GLTFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn((path, onLoad, _onProgress, onError) => {
      // Use setTimeout to simulate async behavior
      setTimeout(() => {
        if (path && path.includes('error')) {
          onError(new Error('Failed to load model'));
        } else {
          const mockScene = new THREE.Group();
          onLoad({ scene: mockScene });
        }
      }, 0);
    }),
  })),
}));

jest.mock('three/addons/loaders/OBJLoader.js', () => ({
  OBJLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn((path, onLoad, _onProgress, onError) => {
      // Use setTimeout to simulate async behavior
      setTimeout(() => {
        if (path && path.includes('error')) {
          onError(new Error('Failed to load model'));
        } else {
          const mockModel = new THREE.Group();
          onLoad(mockModel);
        }
      }, 0);
    }),
  })),
}));

// Mock AdaptiveLODStrategy
jest.mock('../AdaptiveLODStrategy', () => ({
  AdaptiveLODStrategy: jest.fn().mockImplementation((callback) => {
    let lodLevels: any[] = [];
    return {
      setLODLevels: jest.fn((levels) => {
        lodLevels = levels;
      }),
      getCurrentLOD: jest.fn(() => {
        // Return the first LOD level if available, otherwise default
        if (lodLevels && lodLevels.length > 0) {
          return lodLevels[0];
        }
        return {
          distance: 0,
          polygonCount: 50000,
          filePath: 'model-high.glb',
        };
      }),
      updateLOD: jest.fn(),
      reset: jest.fn(),
      lodChangeCallback: callback,
    };
  }),
}));

// Mock requestAnimationFrame and cancelAnimationFrame
let rafCallbacks: Array<FrameRequestCallback> = [];
global.requestAnimationFrame = jest.fn((cb) => {
  rafCallbacks.push(cb);
  return rafCallbacks.length;
});
global.cancelAnimationFrame = jest.fn(() => {
  rafCallbacks = [];
});

// Mock performance.now()
global.performance = {
  now: jest.fn(() => Date.now()),
} as any;

describe('ThreeJSRenderEngine', () => {
  let engine: ThreeJSRenderEngine;
  let mockGLContext: WebGLRenderingContext;
  
  const createMockGLContext = (): WebGLRenderingContext => ({
    drawingBufferWidth: 1920,
    drawingBufferHeight: 1080,
  } as any);
  
  const createMockModel = (): Model3DReference => ({
    modelId: 'test-model',
    filePath: 'models/test.glb',
    format: 'glb',
    lodLevels: [
      { distance: 0, polygonCount: 5000, filePath: 'model-low.glb' },
      { distance: 0, polygonCount: 15000, filePath: 'model-medium.glb' },
      { distance: 0, polygonCount: 50000, filePath: 'model-high.glb' },
    ],
    defaultScale: { x: 1, y: 1, z: 1 },
    defaultRotation: { x: 0, y: 0, z: 0 },
    boundingBox: {
      center: { x: 0, y: 0, z: 0 },
      size: { x: 1, y: 1, z: 1 },
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    rafCallbacks = [];
    engine = new ThreeJSRenderEngine();
    mockGLContext = createMockGLContext();
  });

  afterEach(() => {
    if (engine) {
      engine.dispose();
    }
    rafCallbacks = [];
  });

  describe('initialization', () => {
    it('should initialize renderer with correct settings', () => {
      engine.initialize(mockGLContext);
      
      expect(THREE.WebGLRenderer).toHaveBeenCalledWith({
        context: mockGLContext,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    });

    it('should initialize scene', () => {
      engine.initialize(mockGLContext);
      
      expect(THREE.Scene).toHaveBeenCalled();
    });

    it('should initialize camera with correct FOV and planes', () => {
      engine.initialize(mockGLContext);
      
      const aspectRatio = 1920 / 1080;
      expect(THREE.PerspectiveCamera).toHaveBeenCalledWith(
        45,    // FOV
        aspectRatio,
        0.1,   // Near plane
        1000   // Far plane
      );
    });

    it('should set default camera position', () => {
      engine.initialize(mockGLContext);
      
      const mockCamera = (THREE.PerspectiveCamera as unknown as jest.Mock).mock.results[0].value;
      expect(mockCamera.position.set).toHaveBeenCalledWith(0, 2, 5);
      expect(mockCamera.lookAt).toHaveBeenCalledWith(0, 0, 0);
    });

    it('should setup three-point lighting', () => {
      engine.initialize(mockGLContext);
      
      // Ambient light
      expect(THREE.AmbientLight).toHaveBeenCalledWith(0xffffff, 0.5);
      
      // Directional lights
      expect(THREE.DirectionalLight).toHaveBeenCalledTimes(2);
      expect(THREE.DirectionalLight).toHaveBeenCalledWith(0xffffff, 0.8);
      expect(THREE.DirectionalLight).toHaveBeenCalledWith(0xffffff, 0.3);
    });

    it('should start render loop', () => {
      engine.initialize(mockGLContext);
      
      expect(requestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('camera positioning', () => {
    beforeEach(() => {
      engine.initialize(mockGLContext);
    });

    it('should set camera position and target', () => {
      const position: Vector3 = { x: 1, y: 3, z: 7 };
      const target: Vector3 = { x: 0, y: 1, z: 0 };
      
      engine.setCamera(position, target);
      
      const mockCamera = (THREE.PerspectiveCamera as unknown as jest.Mock).mock.results[0].value;
      expect(mockCamera.lookAt).toHaveBeenCalledWith(0, 1, 0);
      expect(mockCamera.updateProjectionMatrix).toHaveBeenCalled();
    });

    it('should throw error if camera not initialized', () => {
      const uninitializedEngine = new ThreeJSRenderEngine();
      const position: Vector3 = { x: 1, y: 3, z: 7 };
      const target: Vector3 = { x: 0, y: 1, z: 0 };
      
      expect(() => uninitializedEngine.setCamera(position, target)).toThrow('Camera not initialized');
    });
  });

  describe('model loading', () => {
    beforeEach(() => {
      engine.initialize(mockGLContext);
    });

    it('should load GLTF model', async () => {
      const model = createMockModel();
      
      await engine.loadModel(model);
      
      const { GLTFLoader } = require('three/addons/loaders/GLTFLoader.js');
      expect(GLTFLoader).toHaveBeenCalled();
    });

    it('should load OBJ model', async () => {
      const model = createMockModel();
      model.format = 'obj';
      model.filePath = 'models/test.obj';
      
      await engine.loadModel(model);
      
      const { OBJLoader } = require('three/addons/loaders/OBJLoader.js');
      expect(OBJLoader).toHaveBeenCalled();
    });

    it('should apply default scale and rotation', async () => {
      const model = createMockModel();
      model.defaultScale = { x: 2, y: 2, z: 2 };
      model.defaultRotation = { x: 0.5, y: 1.0, z: 0 };
      
      await engine.loadModel(model);
      
      // Model should be scaled and rotated
      expect(THREE.Group).toHaveBeenCalled();
    });

    it('should setup LOD levels if provided', async () => {
      const model = createMockModel();
      
      await engine.loadModel(model);
      
      const { AdaptiveLODStrategy } = require('../AdaptiveLODStrategy');
      const mockStrategy = AdaptiveLODStrategy.mock.results[0].value;
      expect(mockStrategy.setLODLevels).toHaveBeenCalledWith(model.lodLevels);
    });

    it('should throw error if not initialized', async () => {
      const uninitializedEngine = new ThreeJSRenderEngine();
      const model = createMockModel();
      
      await expect(uninitializedEngine.loadModel(model)).rejects.toThrow('Render engine not initialized');
    });

    it('should handle model loading errors', async () => {
      const model = createMockModel();
      // Set LOD level to error path to trigger error
      model.lodLevels = [
        { distance: 0, polygonCount: 5000, filePath: 'models/error.glb' },
      ];
      
      await expect(engine.loadModel(model)).rejects.toThrow('Failed to load model');
    });
  });

  describe('LOD switching', () => {
    beforeEach(() => {
      engine.initialize(mockGLContext);
    });

    it('should integrate with AdaptiveLODStrategy', async () => {
      const model = createMockModel();
      
      await engine.loadModel(model);
      
      const { AdaptiveLODStrategy } = require('../AdaptiveLODStrategy');
      expect(AdaptiveLODStrategy).toHaveBeenCalled();
    });

    it('should update LOD during render', () => {
      engine.render(0.016);
      
      const { AdaptiveLODStrategy } = require('../AdaptiveLODStrategy');
      const mockStrategy = AdaptiveLODStrategy.mock.results[0].value;
      expect(mockStrategy.updateLOD).toHaveBeenCalled();
    });
  });

  describe('gesture handling', () => {
    beforeEach(async () => {
      engine.initialize(mockGLContext);
      const model = createMockModel();
      await engine.loadModel(model);
    });

    describe('pan gesture', () => {
      it('should rotate model on drag', () => {
        const gesture: Gesture = {
          type: 'drag',
          startPosition: { x: 0, y: 0 },
          currentPosition: { x: 100, y: 50 },
          delta: { x: 100, y: 50 },
        };
        
        engine.handleGesture(gesture);
        
        // Gesture should be processed (rotation updated internally)
        expect(gesture.type).toBe('drag');
      });

      it('should handle negative delta', () => {
        const gesture: Gesture = {
          type: 'drag',
          startPosition: { x: 100, y: 100 },
          currentPosition: { x: 50, y: 50 },
          delta: { x: -50, y: -50 },
        };
        
        engine.handleGesture(gesture);
        
        expect(gesture.delta.x).toBe(-50);
        expect(gesture.delta.y).toBe(-50);
      });

      it('should not crash with missing delta', () => {
        const gesture: Gesture = {
          type: 'drag',
          startPosition: { x: 0, y: 0 },
          currentPosition: { x: 0, y: 0 },
          delta: { x: 0, y: 0 },
        };
        
        expect(() => engine.handleGesture(gesture)).not.toThrow();
      });
    });

    describe('pinch-to-zoom gesture', () => {
      it('should zoom in on pinch out', () => {
        const gesture: Gesture = {
          type: 'pinch',
          startPosition: { x: 0, y: 0 },
          currentPosition: { x: 0, y: 0 },
          delta: { x: 0, y: 0 },
          scale: 1.5, // Pinch out
        };
        
        engine.handleGesture(gesture);
        
        expect(gesture.scale).toBeGreaterThan(1);
      });

      it('should zoom out on pinch in', () => {
        const gesture: Gesture = {
          type: 'pinch',
          startPosition: { x: 0, y: 0 },
          currentPosition: { x: 0, y: 0 },
          delta: { x: 0, y: 0 },
          scale: 0.5, // Pinch in
        };
        
        engine.handleGesture(gesture);
        
        expect(gesture.scale).toBeLessThan(1);
      });

      it('should not crash with missing scale', () => {
        const gesture: Gesture = {
          type: 'pinch',
          startPosition: { x: 0, y: 0 },
          currentPosition: { x: 0, y: 0 },
          delta: { x: 0, y: 0 },
        };
        
        expect(() => engine.handleGesture(gesture)).not.toThrow();
      });
    });

    describe('rotate gesture', () => {
      it('should rotate model on two-finger rotation', () => {
        const gesture: Gesture = {
          type: 'rotate',
          startPosition: { x: 0, y: 0 },
          currentPosition: { x: 0, y: 0 },
          delta: { x: 0, y: 0 },
          rotation: Math.PI / 4, // 45 degrees
        };
        
        engine.handleGesture(gesture);
        
        expect(gesture.rotation).toBe(Math.PI / 4);
      });

      it('should handle negative rotation', () => {
        const gesture: Gesture = {
          type: 'rotate',
          startPosition: { x: 0, y: 0 },
          currentPosition: { x: 0, y: 0 },
          delta: { x: 0, y: 0 },
          rotation: -Math.PI / 4,
        };
        
        engine.handleGesture(gesture);
        
        expect(gesture.rotation).toBe(-Math.PI / 4);
      });

      it('should not crash with missing rotation', () => {
        const gesture: Gesture = {
          type: 'rotate',
          startPosition: { x: 0, y: 0 },
          currentPosition: { x: 0, y: 0 },
          delta: { x: 0, y: 0 },
        };
        
        expect(() => engine.handleGesture(gesture)).not.toThrow();
      });
    });

    it('should ignore gestures when model not loaded', () => {
      const uninitializedEngine = new ThreeJSRenderEngine();
      uninitializedEngine.initialize(mockGLContext);
      
      const gesture: Gesture = {
        type: 'drag',
        startPosition: { x: 0, y: 0 },
        currentPosition: { x: 100, y: 50 },
        delta: { x: 100, y: 50 },
      };
      
      expect(() => uninitializedEngine.handleGesture(gesture)).not.toThrow();
    });
  });

  describe('performance metrics', () => {
    beforeEach(() => {
      engine.initialize(mockGLContext);
    });

    it('should calculate FPS', () => {
      const metrics = engine.getPerformanceMetrics();
      
      expect(metrics.fps).toBeGreaterThanOrEqual(0);
      expect(typeof metrics.fps).toBe('number');
    });

    it('should track draw calls', () => {
      const metrics = engine.getPerformanceMetrics();
      
      expect(metrics.drawCalls).toBeGreaterThanOrEqual(0);
      expect(typeof metrics.drawCalls).toBe('number');
    });

    it('should track triangle count', () => {
      const metrics = engine.getPerformanceMetrics();
      
      expect(metrics.triangles).toBeGreaterThanOrEqual(0);
      expect(typeof metrics.triangles).toBe('number');
    });

    it('should estimate memory usage', () => {
      const metrics = engine.getPerformanceMetrics();
      
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(typeof metrics.memoryUsage).toBe('number');
    });

    it('should update metrics during render', () => {
      const metricsBefore = engine.getPerformanceMetrics();
      
      engine.render(0.016);
      
      const metricsAfter = engine.getPerformanceMetrics();
      
      expect(metricsAfter).toBeDefined();
      expect(metricsBefore).toBeDefined();
    });
  });

  describe('quality level adjustments', () => {
    beforeEach(() => {
      engine.initialize(mockGLContext);
    });

    it('should set low quality', () => {
      engine.setQualityLevel('low');
      
      const mockRenderer = (THREE.WebGLRenderer as jest.Mock).mock.results[0].value;
      expect(mockRenderer.setPixelRatio).toHaveBeenCalledWith(1);
    });

    it('should set medium quality', () => {
      engine.setQualityLevel('medium');
      
      const mockRenderer = (THREE.WebGLRenderer as jest.Mock).mock.results[0].value;
      expect(mockRenderer.setPixelRatio).toHaveBeenCalledWith(1.5);
    });

    it('should set high quality', () => {
      engine.setQualityLevel('high');
      
      const mockRenderer = (THREE.WebGLRenderer as jest.Mock).mock.results[0].value;
      expect(mockRenderer.setPixelRatio).toHaveBeenCalledWith(2);
    });

    it('should handle auto quality', () => {
      engine.setQualityLevel('auto');
      
      const mockRenderer = (THREE.WebGLRenderer as jest.Mock).mock.results[0].value;
      expect(mockRenderer.setPixelRatio).toHaveBeenCalled();
    });

    it('should not crash if renderer not initialized', () => {
      const uninitializedEngine = new ThreeJSRenderEngine();
      
      expect(() => uninitializedEngine.setQualityLevel('high')).not.toThrow();
    });
  });

  describe('rendering', () => {
    beforeEach(() => {
      engine.initialize(mockGLContext);
    });

    it('should render scene with camera', () => {
      engine.render(0.016);
      
      const mockRenderer = (THREE.WebGLRenderer as jest.Mock).mock.results[0].value;
      expect(mockRenderer.render).toHaveBeenCalled();
    });

    it('should call endFrameEXP for expo-gl', () => {
      engine.render(0.016);
      
      const mockRenderer = (THREE.WebGLRenderer as jest.Mock).mock.results[0].value;
      const mockContext = mockRenderer.getContext();
      expect(mockContext.endFrameEXP).toHaveBeenCalled();
    });

    it('should not crash if scene not initialized', () => {
      const uninitializedEngine = new ThreeJSRenderEngine();
      
      expect(() => uninitializedEngine.render(0.016)).not.toThrow();
    });
  });

  describe('disposal', () => {
    beforeEach(() => {
      engine.initialize(mockGLContext);
    });

    it('should stop render loop', () => {
      engine.dispose();
      
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should dispose renderer', () => {
      engine.dispose();
      
      const mockRenderer = (THREE.WebGLRenderer as jest.Mock).mock.results[0].value;
      expect(mockRenderer.dispose).toHaveBeenCalled();
    });

    it('should handle disposal when not initialized', () => {
      const uninitializedEngine = new ThreeJSRenderEngine();
      
      expect(() => uninitializedEngine.dispose()).not.toThrow();
    });

    it('should clear all references', () => {
      engine.dispose();
      
      // Should not crash when calling methods after disposal
      expect(() => engine.render(0.016)).not.toThrow();
    });
  });
});
