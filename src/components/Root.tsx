import { App } from '@/components/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div style={{ padding: 20, textAlign: 'center', color: '#ff4757', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ marginBottom: 8 }}>Something went wrong:</p>
      <blockquote>
        <code style={{ fontSize: 12 }}>
          {error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : JSON.stringify(error)}
        </code>
      </blockquote>
    </div>
  );
}

export function Root() {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <App />
    </ErrorBoundary>
  );
}
