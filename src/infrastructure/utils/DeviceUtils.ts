/**
 * Device information utilities
 */

import { Dimensions, Platform, PixelRatio } from 'react-native';
import { DeviceInfo, DeviceType } from '@domain/entities/AppState';

export class DeviceUtils {
  static getDeviceInfo(): DeviceInfo {
    const { width, height } = Dimensions.get('window');
    const pixelDensity = PixelRatio.get();
    
    // Calculate diagonal in inches
    const widthInches = width / (pixelDensity * 160);
    const heightInches = height / (pixelDensity * 160);
    const diagonal = Math.sqrt(widthInches ** 2 + heightInches ** 2);
    
    // Determine device type based on diagonal
    const deviceType: DeviceType = diagonal >= 7 ? 'tablet' : 'phone';
    
    return {
      screenWidth: width,
      screenHeight: height,
      screenDiagonal: diagonal,
      pixelDensity,
      deviceType,
      platform: Platform.OS as 'ios' | 'android',
    };
  }

  static isTablet(): boolean {
    const info = this.getDeviceInfo();
    return info.deviceType === 'tablet';
  }

  static isPhone(): boolean {
    const info = this.getDeviceInfo();
    return info.deviceType === 'phone';
  }

  static getMinTouchTargetSize(): number {
    // Minimum 44x44 pixels for touch targets
    return 44;
  }

  static scaleSize(baseSize: number): number {
    const { width } = Dimensions.get('window');
    const baseWidth = 375; // iPhone SE width as base
    return (width / baseWidth) * baseSize;
  }
}
