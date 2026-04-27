/**
 * Mock for react-native module
 * Used in Jest tests to avoid importing the actual React Native library
 */

export type AppStateStatus = 'active' | 'background' | 'inactive' | 'unknown' | 'extension';

export const AppState = {
  currentState: 'active' as AppStateStatus,
  addEventListener: jest.fn((_event: string, _handler: (state: AppStateStatus) => void) => {
    return {
      remove: jest.fn(),
    };
  }),
  removeEventListener: jest.fn(),
};

// Export other commonly used React Native modules as needed
export default {
  AppState,
};
