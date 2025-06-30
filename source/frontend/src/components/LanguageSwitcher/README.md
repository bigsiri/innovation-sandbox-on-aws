# LanguageSwitcher Component

A CloudScape-based language switcher component that allows users to switch between English and French Canadian languages with persistent storage and accessibility features.

## Features

- 🌐 **Multi-language Support**: Switch between English and French Canadian
- 💾 **Persistent Storage**: Remembers user's language preference in localStorage
- ♿ **Accessibility**: Full ARIA support and screen reader announcements
- 🎨 **CloudScape Integration**: Uses CloudScape Select component with consistent styling
- 📱 **Responsive**: Compact mode for mobile/header integration
- ⚡ **Loading States**: Visual feedback during language switching
- 🔧 **TypeScript**: Full type safety and IntelliSense support

## Basic Usage

```tsx
import { LanguageSwitcher } from '../components/LanguageSwitcher';

function App() {
  return (
    <div>
      <LanguageSwitcher />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Custom CSS class name |
| `disabled` | `boolean` | `false` | Whether the component is disabled |
| `compact` | `boolean` | `false` | Show in compact form (flags only) |
| `ariaLabel` | `string` | `"Select language"` | Custom aria-label for accessibility |
| `onLanguageChange` | `(language: SupportedLanguages) => void` | `undefined` | Callback fired when language changes |
| `loading` | `boolean` | `false` | Whether to show loading state |
| `testId` | `string` | `"language-switcher"` | Custom test ID for testing |

## Integration Examples

### Navigation Header Integration

```tsx
import { TopNavigation } from '@cloudscape-design/components';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

function AppHeader() {
  return (
    <TopNavigation
      identity={{
        href: "/",
        title: "Innovation Sandbox"
      }}
      utilities={[
        {
          type: "menu-dropdown",
          text: "Settings",
          items: [
            {
              id: "language",
              text: <LanguageSwitcher compact={true} />
            }
          ]
        }
      ]}
    />
  );
}
```

### Sidebar Integration

```tsx
import { SideNavigation } from '@cloudscape-design/components';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

function AppSidebar() {
  return (
    <SideNavigation
      header={{
        href: "/",
        text: "Innovation Sandbox"
      }}
      items={[
        // ... other navigation items
        {
          type: "section",
          text: "Settings",
          items: [
            {
              type: "link",
              text: <LanguageSwitcher />,
              href: "#"
            }
          ]
        }
      ]}
    />
  );
}
```

### AppLayout Integration

```tsx
import { AppLayout } from '@cloudscape-design/components';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

function App() {
  return (
    <AppLayout
      navigationOpen={true}
      navigation={<AppSidebar />}
      tools={
        <div style={{ padding: '16px' }}>
          <h3>Settings</h3>
          <LanguageSwitcher />
        </div>
      }
      content={<MainContent />}
    />
  );
}
```

### Custom Styling

```tsx
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import './custom-language-switcher.css';

function CustomLanguageSwitcher() {
  return (
    <LanguageSwitcher 
      className="custom-language-switcher"
      compact={true}
    />
  );
}
```

```css
/* custom-language-switcher.css */
.custom-language-switcher {
  min-width: 120px;
}

.custom-language-switcher .awsui-select-trigger {
  border-radius: 8px;
}
```

## Event Handling

```tsx
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { SupportedLanguages } from '../i18n/types';

function App() {
  const handleLanguageChange = (language: SupportedLanguages) => {
    console.log('Language changed to:', language);
    
    // Optional: Send analytics event
    analytics.track('language_changed', { language });
    
    // Optional: Show success notification
    showNotification(`Language changed to ${language}`);
  };

  return (
    <LanguageSwitcher 
      onLanguageChange={handleLanguageChange}
    />
  );
}
```

## Accessibility Features

The LanguageSwitcher component includes comprehensive accessibility support:

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support via CloudScape Select
- **Screen Reader Announcements**: Announces language changes
- **Loading States**: Accessible loading indicators
- **High Contrast**: Works with high contrast themes

## Testing

The component includes comprehensive test coverage. To run tests:

```bash
npm test src/components/LanguageSwitcher/LanguageSwitcher.test.tsx
```

### Test Categories

- **Rendering**: Basic component rendering and props
- **Language Options**: Correct display of language choices
- **Language Switching**: Functionality and callbacks
- **Loading States**: Visual feedback during operations
- **Persistence**: localStorage integration
- **Accessibility**: ARIA attributes and screen reader support
- **Error Handling**: Graceful error recovery

## Localization

The component uses the following translation keys:

```json
{
  "languageSwitcher": {
    "ariaLabel": "Select language",
    "english": "English", 
    "frenchCanadian": "French (Canada)",
    "switchingLanguage": "Switching language...",
    "languageChanged": "Language changed to {{language}}"
  }
}
```

## Browser Support

- Modern browsers with ES2018+ support
- localStorage support required for persistence
- CloudScape Design System browser requirements

## Performance Considerations

- **Memoization**: Options are memoized to prevent unnecessary re-renders
- **Lazy Loading**: Language resources are loaded on demand
- **Debouncing**: Rapid language switches are handled gracefully
- **Error Boundaries**: Isolated error handling prevents app crashes

## Troubleshooting

### Common Issues

1. **Language not persisting**: Check localStorage permissions
2. **Translations not loading**: Verify i18n configuration
3. **Styling issues**: Ensure CloudScape CSS is loaded
4. **TypeScript errors**: Check SupportedLanguages type imports

### Debug Mode

Enable debug logging:

```tsx
<LanguageSwitcher 
  onLanguageChange={(lang) => {
    console.debug('Language switching to:', lang);
  }}
/>
```

## Contributing

When contributing to this component:

1. Maintain TypeScript strict mode compliance
2. Add tests for new features
3. Update translation files for new text
4. Follow CloudScape design patterns
5. Ensure accessibility compliance

## Related Components

- `useTranslation` hook - Core translation functionality
- `useLanguageInfo` hook - Language metadata
- CloudScape `Select` - Base component
- i18n utilities - Date/number formatting
