# i18n Testing Infrastructure

This directory contains comprehensive testing utilities for bilingual (English/French Canadian) testing throughout the Innovation Sandbox application.

## 📁 File Structure

```
src/test/
├── README.md                    # This documentation
├── i18n-test-utils.tsx         # Main testing utilities
├── translation-test-helpers.ts # Translation-specific helpers
├── mock-translations.ts        # Mock translation resources
└── i18n-test-utils.test.tsx    # Tests for the testing utilities
```

## 🚀 Quick Start

### Basic Component Testing

```tsx
import { renderWithI18n, expectTranslatedText } from '../test/i18n-test-utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render in English', async () => {
    const { getByTestId } = await renderWithI18n(<MyComponent />);
    expectTranslatedText('save'); // Expects "Save"
  });

  it('should render in French Canadian', async () => {
    const { getByTestId } = await renderWithI18n(
      <MyComponent />, 
      { language: 'fr-CA' }
    );
    expectTranslatedText('save', 'fr-CA'); // Expects "Enregistrer"
  });
});
```

### Bilingual Testing

```tsx
import { renderBilingual } from '../test/i18n-test-utils';

describe('MyComponent Bilingual', () => {
  it('should render correctly in both languages', async () => {
    const { english, french } = await renderBilingual(<MyComponent />);
    
    expect(english.getByText('Save')).toBeInTheDocument();
    expect(french.getByText('Enregistrer')).toBeInTheDocument();
  });
});
```

## 🛠️ Core Utilities

### `renderWithI18n(component, options)`

Renders a component with i18n support.

**Parameters:**
- `component`: React element to render
- `options`: Configuration object
  - `language`: 'en' | 'fr-CA' (default: 'en')
  - `i18nInstance`: Custom i18n instance
  - `wrapper`: Additional wrapper component
  - `autoInit`: Auto-initialize i18n (default: true)

**Returns:** `RenderResult & { i18n: typeof i18n }`

```tsx
// Basic usage
const { getByTestId, i18n } = await renderWithI18n(<MyComponent />);

// With French Canadian
const result = await renderWithI18n(<MyComponent />, { language: 'fr-CA' });

// With custom wrapper
const result = await renderWithI18n(<MyComponent />, {
  wrapper: ({ children }) => <QueryClientProvider>{children}</QueryClientProvider>
});
```

### `renderWithLanguage(component, language, options)`

Convenience function for rendering with a specific language.

```tsx
const result = await renderWithLanguage(<MyComponent />, 'fr-CA');
```

### `renderBilingual(component, options)`

Renders component in both languages for comparison testing.

```tsx
const { english, french } = await renderBilingual(<MyComponent />);

expect(english.getByText('Home')).toBeInTheDocument();
expect(french.getByText('Accueil')).toBeInTheDocument();
```

## 🔍 Translation Helpers

### Key Validation

```tsx
import { validateTranslationKeyExists, validateBilingualTranslations } from '../test/translation-test-helpers';

// Check if a key exists
const exists = validateTranslationKeyExists('save'); // true
const existsNested = validateTranslationKeyExists('languageSwitcher.ariaLabel'); // true

// Validate keys exist in both languages
const validation = validateBilingualTranslations(['save', 'cancel', 'loading']);
console.log(validation.valid); // true
console.log(validation.missing); // { en: [], 'fr-CA': [] }
```

### Translation Testing

```tsx
import { 
  getExpectedTranslation, 
  testPluralization, 
  testInterpolation 
} from '../test/translation-test-helpers';

// Get expected translation
const englishSave = getExpectedTranslation('save', 'en'); // "Save"
const frenchSave = getExpectedTranslation('save', 'fr-CA'); // "Enregistrer"

// Test pluralization
const pluralTest = testPluralization('item', 'en');
console.log(pluralTest.singular); // "You have 1 item"
console.log(pluralTest.plural); // "You have 5 items"

// Test interpolation
const interpolationTest = testInterpolation('welcome', { name: 'John' }, 'en');
console.log(interpolationTest.interpolated); // "Welcome, John!"
```

### Assertion Helpers

```tsx
import { 
  expectTranslatedText, 
  expectTranslatedAriaLabel, 
  expectTranslatedPlaceholder 
} from '../test/translation-test-helpers';

// Assert translated text exists
expectTranslatedText('save'); // Expects "Save" in document
expectTranslatedText('save', 'fr-CA'); // Expects "Enregistrer" in document

// Assert translated aria-label
const button = screen.getByRole('button');
expectTranslatedAriaLabel(button, 'languageSwitcher.ariaLabel');

// Assert translated placeholder
const input = screen.getByRole('textbox');
expectTranslatedPlaceholder(input, 'search');
```

## 🧪 Testing Patterns

### 1. Basic Component Translation

```tsx
describe('SaveButton', () => {
  it('should display correct text in both languages', async () => {
    const testCases = [
      { language: 'en' as const, expected: 'Save' },
      { language: 'fr-CA' as const, expected: 'Enregistrer' }
    ];

    for (const { language, expected } of testCases) {
      const { getByRole } = await renderWithI18n(
        <SaveButton />, 
        { language }
      );
      
      expect(getByRole('button')).toHaveTextContent(expected);
    }
  });
});
```

### 2. Pluralization Testing

```tsx
describe('ItemCounter', () => {
  it('should handle pluralization correctly', async () => {
    const { english, french } = await renderBilingual(
      <ItemCounter count={5} />
    );
    
    expect(english.getByText('You have 5 items')).toBeInTheDocument();
    expect(french.getByText('Vous avez 5 éléments')).toBeInTheDocument();
  });

  it('should handle singular form', async () => {
    const { english, french } = await renderBilingual(
      <ItemCounter count={1} />
    );
    
    expect(english.getByText('You have 1 item')).toBeInTheDocument();
    expect(french.getByText('Vous avez 1 élément')).toBeInTheDocument();
  });
});
```

### 3. Interpolation Testing

```tsx
describe('WelcomeMessage', () => {
  it('should interpolate user name correctly', async () => {
    const { english, french } = await renderBilingual(
      <WelcomeMessage userName="Alice" />
    );
    
    expect(english.getByText('Welcome, Alice!')).toBeInTheDocument();
    expect(french.getByText('Bienvenue, Alice !')).toBeInTheDocument();
  });
});
```

### 4. Language Switching

```tsx
describe('LanguageSwitcher', () => {
  it('should update content when language changes', async () => {
    const { getByTestId, i18n } = await renderWithI18n(<MyApp />);
    
    // Initial English content
    expect(getByTestId('content')).toHaveTextContent('Home');
    
    // Change to French
    await changeLanguage(i18n, 'fr-CA');
    
    // Should now show French content
    expect(getByTestId('content')).toHaveTextContent('Accueil');
  });
});
```

### 5. Form Validation Messages

```tsx
describe('LoginForm', () => {
  it('should show validation errors in correct language', async () => {
    const { english, french } = await renderBilingual(<LoginForm />);
    
    // Trigger validation
    fireEvent.click(english.getByRole('button', { name: 'Save' }));
    fireEvent.click(french.getByRole('button', { name: 'Enregistrer' }));
    
    // Check error messages
    expect(english.getByText('Email is required')).toBeInTheDocument();
    expect(french.getByText('Le courriel est obligatoire')).toBeInTheDocument();
  });
});
```

### 6. Date and Number Formatting

```tsx
import { testDateFormatting, testCurrencyFormatting } from '../test/translation-test-helpers';

describe('DateDisplay', () => {
  it('should format dates according to locale', () => {
    const testDate = new Date('2024-03-15');
    
    const englishFormat = testDateFormatting(testDate, 'medium', 'en');
    const frenchFormat = testDateFormatting(testDate, 'medium', 'fr-CA');
    
    expect(englishFormat.formatted).toMatch(/Mar 15, 2024/);
    expect(frenchFormat.formatted).toMatch(/15 mars 2024/);
  });
});

describe('PriceDisplay', () => {
  it('should format currency according to locale', () => {
    const englishPrice = testCurrencyFormatting(1234.56, 'CAD', 'en');
    const frenchPrice = testCurrencyFormatting(1234.56, 'CAD', 'fr-CA');
    
    expect(englishPrice.formatted).toBe('$1,234.56');
    expect(frenchPrice.formatted).toBe('1 234,56 $');
  });
});
```

## 🎯 Best Practices

### 1. Use Descriptive Test Names

```tsx
// ❌ Bad
it('should work', () => {});

// ✅ Good
it('should display "Save" button in English and "Enregistrer" in French Canadian', () => {});
```

### 2. Test Both Languages

```tsx
// ❌ Bad - only tests English
it('should display save button', async () => {
  const { getByText } = await renderWithI18n(<SaveButton />);
  expect(getByText('Save')).toBeInTheDocument();
});

// ✅ Good - tests both languages
it('should display save button in both languages', async () => {
  const { english, french } = await renderBilingual(<SaveButton />);
  expect(english.getByText('Save')).toBeInTheDocument();
  expect(french.getByText('Enregistrer')).toBeInTheDocument();
});
```

### 3. Use Translation Keys, Not Hardcoded Text

```tsx
// ❌ Bad
expect(getByText('Save')).toBeInTheDocument();

// ✅ Good
expectTranslatedText('save');
```

### 4. Test Edge Cases

```tsx
describe('ItemCounter Edge Cases', () => {
  it('should handle zero items', async () => {
    const { english, french } = await renderBilingual(<ItemCounter count={0} />);
    expect(english.getByText('You have 0 items')).toBeInTheDocument();
    expect(french.getByText('Vous avez 0 éléments')).toBeInTheDocument();
  });

  it('should handle negative counts gracefully', async () => {
    const { english } = await renderWithI18n(<ItemCounter count={-1} />);
    expect(english.getByText('Invalid count')).toBeInTheDocument();
  });
});
```

### 5. Clean Up Between Tests

```tsx
describe('MyComponent', () => {
  afterEach(() => {
    cleanupI18n(); // This is done automatically in setupTests.tsx
  });
});
```

## 🔧 Advanced Usage

### Custom i18n Instance

```tsx
const customI18n = await createMockI18nInstance('fr-CA', {
  'fr-CA': {
    common: {
      customKey: 'Custom French Translation'
    }
  }
});

const result = await renderWithI18n(<MyComponent />, {
  i18nInstance: customI18n
});
```

### Testing Hooks

```tsx
import { renderI18nHook } from '../test/i18n-test-utils';
import { useMyI18nHook } from './useMyI18nHook';

describe('useMyI18nHook', () => {
  it('should return translated values', async () => {
    const { result } = await renderI18nHook(() => useMyI18nHook(), 'fr-CA');
    
    expect(result.current.translatedValue).toBe('Valeur traduite');
  });
});
```

### Integration with React Query

```tsx
import { createQueryClientWrapper } from '../setupTests';

const QueryWrapper = createQueryClientWrapper();

const result = await renderWithI18n(<MyComponent />, {
  wrapper: ({ children }) => (
    <QueryWrapper>
      {children}
    </QueryWrapper>
  )
});
```

## 🐛 Troubleshooting

### Common Issues

1. **"Translation key not found"**
   - Check if the key exists in `mock-translations.ts`
   - Verify the namespace is correct
   - Ensure the key path is correct for nested keys

2. **"i18n not initialized"**
   - Make sure to use `await` with `renderWithI18n`
   - Check that `autoInit` is not set to `false`

3. **"Language not switching"**
   - Verify the language code is correct ('en' or 'fr-CA')
   - Check that the component is properly wrapped with i18n provider

4. **"Pluralization not working"**
   - Ensure plural forms are defined in mock translations
   - Check that count parameter is passed correctly

### Debug Tips

```tsx
// Log current i18n state
const { i18n } = await renderWithI18n(<MyComponent />);
console.log('Current language:', i18n.language);
console.log('Available resources:', i18n.getResourceBundle(i18n.language, 'common'));

// Debug translation resolution
const translation = getExpectedTranslation('myKey', 'fr-CA', 'common');
console.log('Expected translation:', translation);
```

## 📚 Additional Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [i18next Testing Guide](https://www.i18next.com/misc/testing)
- [Vitest Documentation](https://vitest.dev/)
- [Innovation Sandbox i18n Documentation](../i18n/README.md)

## 🤝 Contributing

When adding new translation keys or test utilities:

1. Add the keys to `mock-translations.ts`
2. Update the type definitions if needed
3. Add tests for new functionality
4. Update this documentation
5. Ensure all existing tests still pass

## 📝 Examples Repository

For more examples, see the test files in this directory:
- `i18n-test-utils.test.tsx` - Tests for the utilities themselves
- Component test files throughout the application using these utilities
