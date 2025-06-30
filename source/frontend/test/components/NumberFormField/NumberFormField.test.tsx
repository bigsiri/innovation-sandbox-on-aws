// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';

import { NumberFormField } from '../../../src/components/NumberFormField';
import { renderWithSimpleI18n, renderSimpleBilingual } from '../../../src/test/simple-i18n-test-utils';

// Mock NumberInput component
vi.mock('@amzn/innovation-sandbox-frontend/components/NumberInput', () => ({
  NumberInput: ({ onChange, value, placeholder, ariaLabel, isInvalid, isCurrency, min, max, step }: any) => (
    <input
      data-testid="number-input"
      type="number"
      value={value || ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      aria-invalid={isInvalid}
      data-currency={isCurrency}
      min={min}
      max={max}
      step={step}
    />
  ),
}));

describe('NumberFormField Component', () => {
  const mockInput = {
    onChange: vi.fn(),
    value: 0,
    name: 'testNumber',
  };

  const mockMeta = {
    error: undefined,
    submitFailed: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with basic props', () => {
      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={mockMeta}
        />
      );

      expect(screen.getByLabelText('Test Number')).toBeInTheDocument();
      expect(screen.getByTestId('number-input')).toBeInTheDocument();
    });

    it('should render with description', () => {
      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          description="Enter a number"
          meta={mockMeta}
        />
      );

      expect(screen.getByText('Enter a number')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          helperText="This is helper text"
          meta={mockMeta}
        />
      );

      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });

    it('should render with end text', () => {
      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          endText="units"
          meta={mockMeta}
        />
      );

      expect(screen.getByText('units')).toBeInTheDocument();
    });
  });

  describe('Currency Support', () => {
    it('should render as currency field', () => {
      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Price"
          isCurrency={true}
          meta={mockMeta}
        />
      );

      const numberInput = screen.getByTestId('number-input');
      expect(numberInput).toHaveAttribute('data-currency', 'true');
    });
  });

  describe('Validation and Error Handling', () => {
    it('should display error message when error exists and form submitted', () => {
      const metaWithError = {
        error: 'This field is required',
        submitFailed: true,
      };

      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={metaWithError}
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should display error when showError is true', () => {
      const metaWithError = {
        error: 'Invalid number',
        submitFailed: false,
      };

      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          showError={true}
          meta={metaWithError}
        />
      );

      expect(screen.getByText('Invalid number')).toBeInTheDocument();
    });

    it('should translate common validation errors in English', () => {
      const metaWithError = {
        error: 'required field error',
        submitFailed: true,
      };

      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={metaWithError}
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should translate common validation errors in French Canadian', () => {
      const metaWithError = {
        error: 'required field error',
        submitFailed: true,
      };

      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={metaWithError}
        />,
        { language: 'fr-CA' }
      );

      expect(screen.getByText('Ce champ est obligatoire')).toBeInTheDocument();
    });

    it('should translate number validation errors', () => {
      const metaWithError = {
        error: 'invalid number format',
        submitFailed: true,
      };

      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={metaWithError}
        />
      );

      expect(screen.getByText('Please enter a valid number')).toBeInTheDocument();
    });

    it('should translate positive number validation errors', () => {
      const metaWithError = {
        error: 'must be positive value',
        submitFailed: true,
      };

      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={metaWithError}
        />
      );

      expect(screen.getByText('Please enter a positive number')).toBeInTheDocument();
    });

    it('should handle translation key errors', () => {
      const metaWithError = {
        error: 'validation.greaterThanZero',
        submitFailed: true,
      };

      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={metaWithError}
        />
      );

      expect(screen.getByText('Please enter a number greater than 0')).toBeInTheDocument();
    });

    it('should mark input as invalid when there's an error', () => {
      const metaWithError = {
        error: 'Invalid number',
        submitFailed: true,
      };

      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={metaWithError}
        />
      );

      const numberInput = screen.getByTestId('number-input');
      expect(numberInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Placeholders and Localization', () => {
    it('should use custom placeholder', () => {
      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          placeholder="Custom placeholder"
          meta={mockMeta}
        />
      );

      expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
    });

    it('should use default placeholder for regular numbers in English', () => {
      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={mockMeta}
        />
      );

      expect(screen.getByPlaceholderText('Enter number')).toBeInTheDocument();
    });

    it('should use default placeholder for regular numbers in French Canadian', () => {
      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={mockMeta}
        />,
        { language: 'fr-CA' }
      );

      expect(screen.getByPlaceholderText('Saisir le nombre')).toBeInTheDocument();
    });

    it('should use currency placeholder for currency fields', () => {
      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Price"
          isCurrency={true}
          meta={mockMeta}
        />
      );

      expect(screen.getByPlaceholderText('Enter number')).toBeInTheDocument();
    });
  });

  describe('Input Attributes', () => {
    it('should pass min, max, and step attributes', () => {
      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          min={0}
          max={100}
          step={0.1}
          meta={mockMeta}
        />
      );

      const numberInput = screen.getByTestId('number-input');
      expect(numberInput).toHaveAttribute('min', '0');
      expect(numberInput).toHaveAttribute('max', '100');
      expect(numberInput).toHaveAttribute('step', '0.1');
    });

    it('should set aria-label from label prop', () => {
      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number Field"
          meta={mockMeta}
        />
      );

      const numberInput = screen.getByTestId('number-input');
      expect(numberInput).toHaveAttribute('aria-label', 'Test Number Field');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when value changes', () => {
      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={mockMeta}
        />
      );

      const numberInput = screen.getByTestId('number-input');
      fireEvent.change(numberInput, { target: { value: '42' } });

      expect(mockInput.onChange).toHaveBeenCalledWith(42);
    });

    it('should handle invalid number input', () => {
      renderWithSimpleI18n(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={mockMeta}
        />
      );

      const numberInput = screen.getByTestId('number-input');
      fireEvent.change(numberInput, { target: { value: 'invalid' } });

      expect(mockInput.onChange).toHaveBeenCalledWith(0);
    });
  });

  describe('Bilingual Support', () => {
    it('should render correctly in both languages', () => {
      const { english, french } = renderSimpleBilingual(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={mockMeta}
        />
      );

      // Both should render the input
      expect(english.getByTestId('number-input')).toBeInTheDocument();
      expect(french.getByTestId('number-input')).toBeInTheDocument();

      // Check placeholders
      expect(english.getByPlaceholderText('Enter number')).toBeInTheDocument();
      expect(french.getByPlaceholderText('Saisir le nombre')).toBeInTheDocument();
    });

    it('should display errors in both languages', () => {
      const metaWithError = {
        error: 'number validation error',
        submitFailed: true,
      };

      const { english, french } = renderSimpleBilingual(
        <NumberFormField
          input={mockInput}
          label="Test Number"
          meta={metaWithError}
        />
      );

      expect(english.getByText('Please enter a valid number')).toBeInTheDocument();
      expect(french.getByText('Veuillez saisir un nombre valide')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined value', () => {
      const inputWithUndefinedValue = {
        ...mockInput,
        value: undefined,
      };

      renderWithSimpleI18n(
        <NumberFormField
          input={inputWithUndefinedValue}
          label="Test Number"
          meta={mockMeta}
        />
      );

      const numberInput = screen.getByTestId('number-input');
      expect(numberInput).toHaveValue('');
    });

    it('should handle null value', () => {
      const inputWithNullValue = {
        ...mockInput,
        value: null,
      };

      renderWithSimpleI18n(
        <NumberFormField
          input={inputWithNullValue}
          label="Test Number"
          meta={mockMeta}
        />
      );

      const numberInput = screen.getByTestId('number-input');
      expect(numberInput).toHaveValue('');
    });

    it('should handle zero value', () => {
      const inputWithZeroValue = {
        ...mockInput,
        value: 0,
      };

      renderWithSimpleI18n(
        <NumberFormField
          input={inputWithZeroValue}
          label="Test Number"
          meta={mockMeta}
        />
      );

      const numberInput = screen.getByTestId('number-input');
      expect(numberInput).toHaveValue('0');
    });

    it('should handle negative values', () => {
      const inputWithNegativeValue = {
        ...mockInput,
        value: -42,
      };

      renderWithSimpleI18n(
        <NumberFormField
          input={inputWithNegativeValue}
          label="Test Number"
          meta={mockMeta}
        />
      );

      const numberInput = screen.getByTestId('number-input');
      expect(numberInput).toHaveValue('-42');
    });

    it('should handle decimal values', () => {
      const inputWithDecimalValue = {
        ...mockInput,
        value: 3.14159,
      };

      renderWithSimpleI18n(
        <NumberFormField
          input={inputWithDecimalValue}
          label="Test Number"
          meta={mockMeta}
        />
      );

      const numberInput = screen.getByTestId('number-input');
      expect(numberInput).toHaveValue('3.14159');
    });
  });
});
