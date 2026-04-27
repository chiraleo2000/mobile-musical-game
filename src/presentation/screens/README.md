# Presentation Screens

This directory contains the main screen components for the mobile musical instrument game.

## InstrumentLibraryScreen

The main screen where users browse and select instruments.

### Features

- **Grouped Display**: Instruments are grouped by nationality (Thai/International)
- **Bilingual Support**: All instrument names displayed in both Thai and English
- **Filter Controls**: 
  - Nationality filters: All, Thai, International
  - Playing method filters: All, Striking, Plucked, Pressed
- **Responsive Layout**: Automatically adapts to phone and tablet screen sizes
- **Loading States**: Shows loading indicator during instrument selection
- **Touch Targets**: All interactive elements meet minimum 44x44 pixel requirement

### Usage

```tsx
import { InstrumentLibraryScreen } from '@presentation/screens';

// Basic usage with AppStateManager
<InstrumentLibraryScreen />

// With custom selection handler
<InstrumentLibraryScreen 
  onInstrumentSelect={(instrumentId) => {
    console.log('Selected:', instrumentId);
  }}
/>
```

### Props

- `onInstrumentSelect?: (instrumentId: string) => void` - Optional callback when an instrument is selected. If not provided, uses AppStateManager's selectInstrument method.

### Requirements Satisfied

- **Requirement 1.3**: Displays instruments grouped by nationality
- **Requirement 1.4**: Shows bilingual instrument names (Thai/English)
- **Requirement 12.1**: Provides instrument selection interface
- **Requirement 12.2**: Implements nationality navigation controls
- **Requirement 12.3**: Implements playing method filter controls
- **Requirement 12.4**: Loads instruments efficiently

### Integration

The screen integrates with:
- **InstrumentLibrary**: For accessing instrument data
- **AppStateManager**: For state management and instrument selection
- **DisplayManager**: For responsive layout calculations
- **DeviceUtils**: For device information and responsive sizing

### Responsive Behavior

**Phone Layout (< 7 inches)**:
- Vertical scrolling list
- Compact filter buttons
- Single column instrument cards

**Tablet Layout (≥ 7 inches)**:
- Larger text and spacing
- Expanded filter buttons
- Enhanced touch targets

### Accessibility

- Minimum touch target size: 44x44 pixels
- Clear visual feedback on button press
- Bilingual labels for all controls
- Loading indicators for async operations
