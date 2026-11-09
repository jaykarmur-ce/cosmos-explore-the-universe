import { Component } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/**
 * Catches render errors. Pass `fallback` (element or render function) to
 * customise, and `resetKey` to clear the error when it changes (e.g. route).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[COSMOS] Render error:', error, info?.componentStack);
    this.props.onError?.(error);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset() {
    this.setState({ error: null });
  }

  render() {
    const { error } = this.state;
    const { fallback, children } = this.props;
    if (!error) return children;
    if (typeof fallback === 'function') return fallback({ error, reset: this.reset });
    if (fallback !== undefined) return fallback;

    return (
      <div className="container page">
        <div className="empty" role="alert">
          <div className="empty__icon">
            <AlertTriangle aria-hidden="true" />
          </div>
          <h1 className="h2">Signal lost</h1>
          <p>Something went wrong while rendering this section. You can try again or return to the homepage.</p>
          <p className="mono dim" style={{ fontSize: 12 }}>
            {String(error?.message ?? error)}
          </p>
          <div className="empty__actions">
            <button type="button" className="btn btn--primary" onClick={this.reset}>
              <RotateCcw aria-hidden="true" /> Try again
            </button>
            <Link to="/" className="btn" onClick={this.reset}>
              <Home aria-hidden="true" /> Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
