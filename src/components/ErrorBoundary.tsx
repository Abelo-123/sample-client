import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: (props: { error: unknown }) => ReactNode;
}

interface State {
  hasError: boolean;
  error: unknown;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback({ error: this.state.error });
    }
    return this.props.children;
  }
}
