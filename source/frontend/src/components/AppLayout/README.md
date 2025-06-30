# AppLayout Components

This directory contains the main application layout components for the Innovation Sandbox frontend.

## Components

### NavHeader

The main navigation header component that includes:

- Application title and logo
- Settings menu (theme, density)
- Information button
- User menu (when authenticated)
- **Language switcher** (integrated in Step 14)

#### Language Switcher Integration

The language switcher is integrated into the navigation header and provides:

- **Compact display**: Shows flag + language in a dropdown
- **Persistent preferences**: Saves language choice to localStorage
- **Accessibility**: Full ARIA support and keyboard navigation
- **Responsive design**: Adapts to different screen sizes
- **Seamless integration**: Works with existing navigation utilities

#### Props

```typescript
interface NavHeaderProps {
  title?: string;
  logo?: string;
  href?: string;
  user?: IsbUser;
  onExit?: () => void;
  showLanguageSwitcher?: boolean;        // New: Control language switcher visibility
  onLanguageChange?: (language: SupportedLanguages) => void; // New: Language change callback
}
```

#### Usage

```tsx
<NavHeader
  logo={logo}
  user={user}
  onExit={handleExit}
  showLanguageSwitcher={true}           // Enable language switcher (default: true)
  onLanguageChange={handleLanguageChange} // Optional callback for language changes
/>
```

#### Positioning

The language switcher is positioned as an overlay in the top-right corner of the navigation header:

- **Desktop**: Absolute positioned in top-right with proper spacing
- **Tablet**: Slightly smaller with adjusted positioning
- **Mobile**: Responsive layout that adapts to smaller screens

#### Styling

The language switcher uses CSS modules (`NavHeader.module.scss`) for styling:

- Integrates seamlessly with CloudScape design system
- Supports both light and dark themes
- Maintains proper z-index for dropdown functionality
- Responsive breakpoints for different screen sizes

### BaseLayout

The main application layout wrapper that:

- Manages user authentication state
- Handles navigation items based on user roles
- Integrates the NavHeader with language switching support
- Manages breadcrumb navigation
- Handles logout functionality

#### Language Change Handling

The BaseLayout component now includes:

```typescript
const handleLanguageChange = useCallback((language: SupportedLanguages) => {
  // Language change is handled by the LanguageSwitcher component
  // Additional logic can be added here for:
  // - Analytics tracking
  // - User preference saving to backend
  // - Custom notifications
  console.log(`Language changed to: ${language}`);
}, []);
```

## Features

### Responsive Design

The navigation header adapts to different screen sizes:

- **Desktop (>768px)**: Full navigation with language switcher in top-right
- **Tablet (480-768px)**: Compact layout with adjusted positioning
- **Mobile (<480px)**: Mobile-optimized layout with responsive language switcher

### Accessibility

- Full ARIA support for all interactive elements
- Keyboard navigation support
- Screen reader announcements for language changes
- High contrast mode support
- Proper focus management

### Theme Support

- Supports both light and dark themes
- Consistent styling with CloudScape design system
- Proper contrast ratios for accessibility
- Theme-aware language switcher styling

## Testing

The components include comprehensive tests:

- Unit tests for all functionality
- Bilingual rendering tests
- User interaction tests
- Accessibility compliance tests
- Responsive behavior tests

### Running Tests

```bash
npm test -- NavHeader.test.tsx
```

## Browser Support

The language switcher integration supports:

- Modern browsers with ES2020+ support
- localStorage for preference persistence
- CSS Grid and Flexbox for responsive layout
- CloudScape design system compatibility

## Performance

- Lazy loading of translation resources
- Efficient re-rendering with React.memo and useMemo
- Minimal bundle size impact
- Optimized CSS with CSS modules
