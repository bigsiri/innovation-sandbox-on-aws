// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';

import { ErrorPanel } from '../../src/components/ErrorPanel';
import { renderWithSimpleI18n, renderSimpleBilingual } from '../../src/test/simple-i18n-test-utils';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('ErrorPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('General Error Display', () => {
    it('should display default error message in English', () => {
      renderWithSimpleI18n(<ErrorPanel />);
      
      expect(screen.getByText('Whoops, something went wrong.')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    it('should display default error message in French Canadian', () => {
      renderWithSimpleI18n(<ErrorPanel />, { language: 'fr-CA' });
      
      expect(screen.getByText('Oups, quelque chose s\'est mal passé.')).toBeInTheDocument();
      expect(screen.getByText('Une erreur inattendue s\'est produite. Veuillez réessayer.')).toBeInTheDocument();
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    it('should display custom header and description', () => {
      const customHeader = 'Custom Error Title';
      const customDescription = 'Custom error description';
      
      renderWithSimpleI18n(
        <ErrorPanel header={customHeader} description={customDescription} />
      );
      
      expect(screen.getByText(customHeader)).toBeInTheDocument();
      expect(screen.getByText(customDescription)).toBeInTheDocument();
    });

    it('should call retry function when retry button is clicked', () => {
      const mockRetry = vi.fn();
      
      renderWithSimpleI18n(<ErrorPanel retry={mockRetry} />);
      
      const retryButton = screen.getByText('Try again');
      fireEvent.click(retryButton);
      
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Session Expired Error', () => {
    it('should display session expired message for 403 error in English', () => {
      const error403 = new Error('403 Forbidden');
      
      renderWithSimpleI18n(<ErrorPanel error={error403} />);
      
      expect(screen.getByText('Session Expired')).toBeInTheDocument();
      expect(screen.getByText('Your session has expired. Please log in again to continue.')).toBeInTheDocument();
      expect(screen.getByText('Login Again')).toBeInTheDocument();
    });

    it('should display session expired message for 403 error in French Canadian', () => {
      const error403 = new Error('403 Forbidden');
      
      renderWithSimpleI18n(<ErrorPanel error={error403} />, { language: 'fr-CA' });
      
      expect(screen.getByText('Session expirée')).toBeInTheDocument();
      expect(screen.getByText('Votre session a expiré. Veuillez vous reconnecter pour continuer.')).toBeInTheDocument();
      expect(screen.getByText('Se reconnecter')).toBeInTheDocument();
    });

    it('should display session expired message for 401 error', () => {
      const error401 = new Error('401 Unauthorized');
      
      renderWithSimpleI18n(<ErrorPanel error={error401} />);
      
      expect(screen.getByText('Session Expired')).toBeInTheDocument();
      expect(screen.getByText('Login Again')).toBeInTheDocument();
    });

    it('should call navigate(0) when login again button is clicked', () => {
      const error403 = new Error('403 Forbidden');
      
      renderWithSimpleI18n(<ErrorPanel error={error403} />);
      
      const loginButton = screen.getByText('Login Again');
      fireEvent.click(loginButton);
      
      expect(mockNavigate).toHaveBeenCalledWith(0);
    });
  });

  describe('Network Error', () => {
    it('should display network error message for network errors in English', () => {
      const networkError = new Error('Network request failed');
      
      renderWithSimpleI18n(<ErrorPanel error={networkError} />);
      
      expect(screen.getByText('Network Error')).toBeInTheDocument();
      expect(screen.getByText('Unable to connect to the server. Please check your internet connection and try again.')).toBeInTheDocument();
    });

    it('should display network error message for network errors in French Canadian', () => {
      const networkError = new Error('Network request failed');
      
      renderWithSimpleI18n(<ErrorPanel error={networkError} />, { language: 'fr-CA' });
      
      expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
      expect(screen.getByText('Impossible de se connecter au serveur. Veuillez vérifier votre connexion Internet et réessayer.')).toBeInTheDocument();
    });

    it('should handle fetch errors as network errors', () => {
      const fetchError = new Error('fetch failed');
      
      renderWithSimpleI18n(<ErrorPanel error={fetchError} />);
      
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });

    it('should handle timeout errors as network errors', () => {
      const timeoutError = new Error('Request timeout');
      
      renderWithSimpleI18n(<ErrorPanel error={timeoutError} />);
      
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  describe('Additional Action Buttons', () => {
    it('should display contact support button when showContactSupport is true', () => {
      renderWithSimpleI18n(<ErrorPanel showContactSupport={true} />);
      
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });

    it('should display go home button when showGoHome is true', () => {
      renderWithSimpleI18n(<ErrorPanel showGoHome={true} />);
      
      expect(screen.getByText('Go to Home')).toBeInTheDocument();
    });

    it('should navigate to home when go home button is clicked', () => {
      renderWithSimpleI18n(<ErrorPanel showGoHome={true} />);
      
      const goHomeButton = screen.getByText('Go to Home');
      fireEvent.click(goHomeButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should display both additional buttons when both props are true', () => {
      renderWithSimpleI18n(<ErrorPanel showContactSupport={true} showGoHome={true} />);
      
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
      expect(screen.getByText('Go to Home')).toBeInTheDocument();
    });
  });

  describe('Bilingual Support', () => {
    it('should render correctly in both languages', () => {
      const { english, french } = renderSimpleBilingual(<ErrorPanel />);
      
      // English
      expect(english.getByText('Whoops, something went wrong.')).toBeInTheDocument();
      expect(english.getByText('Try again')).toBeInTheDocument();
      
      // French Canadian
      expect(french.getByText('Oups, quelque chose s\'est mal passé.')).toBeInTheDocument();
      expect(french.getByText('Réessayer')).toBeInTheDocument();
    });

    it('should handle session expired errors in both languages', () => {
      const error403 = new Error('403 Forbidden');
      const { english, french } = renderSimpleBilingual(<ErrorPanel error={error403} />);
      
      // English
      expect(english.getByText('Session Expired')).toBeInTheDocument();
      expect(english.getByText('Login Again')).toBeInTheDocument();
      
      // French Canadian
      expect(french.getByText('Session expirée')).toBeInTheDocument();
      expect(french.getByText('Se reconnecter')).toBeInTheDocument();
    });

    it('should handle network errors in both languages', () => {
      const networkError = new Error('Network request failed');
      const { english, french } = renderSimpleBilingual(<ErrorPanel error={networkError} />);
      
      // English
      expect(english.getByText('Network Error')).toBeInTheDocument();
      
      // French Canadian
      expect(french.getByText('Erreur réseau')).toBeInTheDocument();
    });
  });

  describe('Error Type Detection', () => {
    it('should correctly identify session expired errors', () => {
      const errors = [
        new Error('403 Forbidden'),
        new Error('401 Unauthorized'),
        new Error('Error: Unauthorized access'),
      ];

      errors.forEach(error => {
        const { unmount } = renderWithSimpleI18n(<ErrorPanel error={error} />);
        expect(screen.getByText('Session Expired')).toBeInTheDocument();
        unmount();
      });
    });

    it('should correctly identify network errors', () => {
      const errors = [
        new Error('Network request failed'),
        new Error('fetch error occurred'),
        new Error('Request timeout'),
      ];

      errors.forEach(error => {
        const { unmount } = renderWithSimpleI18n(<ErrorPanel error={error} />);
        expect(screen.getByText('Network Error')).toBeInTheDocument();
        unmount();
      });
    });

    it('should default to general error for unrecognized errors', () => {
      const unknownError = new Error('Some unknown error');
      
      renderWithSimpleI18n(<ErrorPanel error={unknownError} />);
      
      expect(screen.getByText('Whoops, something went wrong.')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper alert structure', () => {
      renderWithSimpleI18n(<ErrorPanel />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have accessible button text', () => {
      const mockRetry = vi.fn();
      renderWithSimpleI18n(<ErrorPanel retry={mockRetry} />);
      
      const button = screen.getByRole('button', { name: 'Try again' });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('should maintain accessibility in French Canadian', () => {
      const mockRetry = vi.fn();
      renderWithSimpleI18n(<ErrorPanel retry={mockRetry} />, { language: 'fr-CA' });
      
      const button = screen.getByRole('button', { name: 'Réessayer' });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });
  });
});
