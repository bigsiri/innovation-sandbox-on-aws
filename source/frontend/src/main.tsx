// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";

import { App } from "@amzn/innovation-sandbox-frontend/App";
import { initializeI18n } from "@amzn/innovation-sandbox-frontend/i18n";

// Loading component for i18n initialization
const I18nLoadingFallback: React.FC = () => (
  <div 
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '16px',
      color: '#666'
    }}
  >
    Loading application...
  </div>
);

// Error boundary for i18n initialization errors
class I18nErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('i18n initialization error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            padding: '20px',
            textAlign: 'center'
          }}
        >
          <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>
            Application Loading Error
          </h2>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            There was an error loading the application. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize i18n and render the app
const initializeApp = async () => {
  try {
    // Initialize i18n before rendering the app
    await initializeI18n();
    
    // Get the root element
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    // Create React root and render the app
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <I18nErrorBoundary>
          <Suspense fallback={<I18nLoadingFallback />}>
            <App />
          </Suspense>
        </I18nErrorBoundary>
      </React.StrictMode>
    );

  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // Fallback rendering without i18n
    const rootElement = document.getElementById("root");
    if (rootElement) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            padding: '20px',
            textAlign: 'center'
          }}
        >
          <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>
            Initialization Error
          </h2>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            The application failed to initialize properly. Please check your internet connection and refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', color: '#666' }}>
              Technical Details
            </summary>
            <pre style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        </div>
      );
    }
  }
};

// Start the application
initializeApp();
