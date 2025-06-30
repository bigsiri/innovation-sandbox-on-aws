// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';

import { Form } from '../../../src/components/Form';
import { renderWithSimpleI18n, renderSimpleBilingual } from '../../../src/test/simple-i18n-test-utils';

// Mock the Toast component
vi.mock('@amzn/innovation-sandbox-frontend/components/Toast', () => ({
  showErrorToast: vi.fn(),
}));

// Mock FormRenderer
vi.mock('@aws-northstar/ui', () => ({
  FormRenderer: ({ onSubmit, validate, schema, ...props }: any) => (
    <div data-testid="form-renderer">
      <div data-testid="form-schema">{JSON.stringify(schema)}</div>
      <button 
        data-testid="submit-button" 
        onClick={() => onSubmit && onSubmit({})}
      >
        Submit
      </button>
      <button 
        data-testid="validate-button" 
        onClick={() => validate && validate({})}
      >
        Validate
      </button>
    </div>
  ),
}));

describe('Form Component', () => {
  const mockSchema = {
    header: 'Test Form',
    fields: [
      {
        component: 'text',
        name: 'testField',
        label: 'Test Field',
      },
    ],
  };

  const mockOnSubmit = vi.fn();
  const mockValidate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render form with schema', () => {
      renderWithSimpleI18n(
        <Form 
          schema={mockSchema}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByTestId('form-renderer')).toBeInTheDocument();
      expect(screen.getByTestId('form-schema')).toHaveTextContent(JSON.stringify(mockSchema));
    });

    it('should apply shift-up class when insideTab is true and no header', () => {
      const schemaWithoutHeader = { ...mockSchema, header: undefined };
      
      renderWithSimpleI18n(
        <Form 
          schema={schemaWithoutHeader}
          onSubmit={mockOnSubmit}
          insideTab={true}
        />
      );

      const formContainer = screen.getByTestId('form-renderer').parentElement;
      expect(formContainer).toHaveClass('shiftUp');
    });

    it('should not apply shift-up class when insideTab is true but header exists', () => {
      renderWithSimpleI18n(
        <Form 
          schema={mockSchema}
          onSubmit={mockOnSubmit}
          insideTab={true}
        />
      );

      const formContainer = screen.getByTestId('form-renderer').parentElement;
      expect(formContainer).not.toHaveClass('shiftUp');
    });
  });

  describe('Form Submission', () => {
    it('should handle successful form submission', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      renderWithSimpleI18n(
        <Form 
          schema={mockSchema}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should handle form submission errors with default message in English', async () => {
      const error = new Error('Test error');
      mockOnSubmit.mockRejectedValue(error);

      const { showErrorToast } = await import('@amzn/innovation-sandbox-frontend/components/Toast');

      renderWithSimpleI18n(
        <Form 
          schema={mockSchema}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(showErrorToast).toHaveBeenCalledWith('Test error', 'Whoops, something went wrong!');
      });
    });

    it('should handle form submission errors with default message in French Canadian', async () => {
      const error = new Error('Test error');
      mockOnSubmit.mockRejectedValue(error);

      const { showErrorToast } = await import('@amzn/innovation-sandbox-frontend/components/Toast');

      renderWithSimpleI18n(
        <Form 
          schema={mockSchema}
          onSubmit={mockOnSubmit}
        />,
        { language: 'fr-CA' }
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(showErrorToast).toHaveBeenCalledWith('Test error', 'Oups, quelque chose s\'est mal passé !');
      });
    });

    it('should handle form submission errors with custom error header', async () => {
      const error = new Error('Test error');
      const customErrorHeader = 'Custom Error Header';
      mockOnSubmit.mockRejectedValue(error);

      const { showErrorToast } = await import('@amzn/innovation-sandbox-frontend/components/Toast');

      renderWithSimpleI18n(
        <Form 
          schema={mockSchema}
          onSubmit={mockOnSubmit}
          errorHeader={customErrorHeader}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(showErrorToast).toHaveBeenCalledWith('Test error', customErrorHeader);
      });
    });

    it('should handle non-Error objects in submission errors', async () => {
      const errorString = 'String error';
      mockOnSubmit.mockRejectedValue(errorString);

      const { showErrorToast } = await import('@amzn/innovation-sandbox-frontend/components/Toast');

      renderWithSimpleI18n(
        <Form 
          schema={mockSchema}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(showErrorToast).toHaveBeenCalledWith('String error', 'Whoops, something went wrong!');
      });
    });
  });

  describe('Form Validation', () => {
    it('should handle form validation', () => {
      const mockValidationResult = { testField: 'Test error' };
      mockValidate.mockReturnValue(mockValidationResult);

      renderWithSimpleI18n(
        <Form 
          schema={mockSchema}
          onSubmit={mockOnSubmit}
          validate={mockValidate}
        />
      );

      const validateButton = screen.getByTestId('validate-button');
      fireEvent.click(validateButton);

      expect(mockValidate).toHaveBeenCalledWith({});
    });

    it('should handle validation without validate function', () => {
      renderWithSimpleI18n(
        <Form 
          schema={mockSchema}
          onSubmit={mockOnSubmit}
        />
      );

      const validateButton = screen.getByTestId('validate-button');
      fireEvent.click(validateButton);

      // Should not throw error
      expect(screen.getByTestId('form-renderer')).toBeInTheDocument();
    });
  });

  describe('Form Context', () => {
    it('should provide form context with translation function', () => {
      const TestContextConsumer = () => {
        const { useFormContext } = require('../../../src/components/Form/context');
        const { formValues, formErrors, t } = useFormContext();
        
        return (
          <div>
            <div data-testid="form-values">{JSON.stringify(formValues)}</div>
            <div data-testid="form-errors">{JSON.stringify(formErrors)}</div>
            <div data-testid="has-translation">{t ? 'true' : 'false'}</div>
          </div>
        );
      };

      renderWithSimpleI18n(
        <Form schema={mockSchema} onSubmit={mockOnSubmit}>
          <TestContextConsumer />
        </Form>
      );

      expect(screen.getByTestId('has-translation')).toHaveTextContent('true');
    });
  });

  describe('Bilingual Support', () => {
    it('should render correctly in both languages', async () => {
      const error = new Error('Test error');
      mockOnSubmit.mockRejectedValue(error);

      const { showErrorToast } = await import('@amzn/innovation-sandbox-frontend/components/Toast');

      const { english, french } = renderSimpleBilingual(
        <Form 
          schema={mockSchema}
          onSubmit={mockOnSubmit}
        />
      );

      // Both should render the form
      expect(english.getByTestId('form-renderer')).toBeInTheDocument();
      expect(french.getByTestId('form-renderer')).toBeInTheDocument();

      // Test error messages in both languages
      fireEvent.click(english.getByTestId('submit-button'));
      fireEvent.click(french.getByTestId('submit-button'));

      await waitFor(() => {
        expect(showErrorToast).toHaveBeenCalledWith('Test error', 'Whoops, something went wrong!');
        expect(showErrorToast).toHaveBeenCalledWith('Test error', 'Oups, quelque chose s\'est mal passé !');
      });
    });
  });

  describe('Initial Values', () => {
    it('should handle initial values', () => {
      const initialValues = { testField: 'initial value' };

      renderWithSimpleI18n(
        <Form 
          schema={mockSchema}
          onSubmit={mockOnSubmit}
          initialValues={initialValues}
        />
      );

      expect(screen.getByTestId('form-renderer')).toBeInTheDocument();
    });

    it('should handle empty initial values', () => {
      renderWithSimpleI18n(
        <Form 
          schema={mockSchema}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByTestId('form-renderer')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle submission without onSubmit function', async () => {
      renderWithSimpleI18n(
        <Form schema={mockSchema} />
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Should not throw error
      expect(screen.getByTestId('form-renderer')).toBeInTheDocument();
    });

    it('should handle errors without message property', async () => {
      const errorObject = { code: 'TEST_ERROR', details: 'Test details' };
      mockOnSubmit.mockRejectedValue(errorObject);

      const { showErrorToast } = await import('@amzn/innovation-sandbox-frontend/components/Toast');

      renderWithSimpleI18n(
        <Form 
          schema={mockSchema}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(showErrorToast).toHaveBeenCalledWith(
          '[object Object]', 
          'Whoops, something went wrong!'
        );
      });
    });
  });
});
