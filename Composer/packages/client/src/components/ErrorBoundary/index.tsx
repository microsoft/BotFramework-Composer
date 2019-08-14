/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

import { StoreContext } from '../../store';
import { ErrorPopup } from '../ErrorPopup';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  setError: (err: { message: string; summary: string }) => void;
}

// only class component can be a error boundary
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps, context) {
    super(props);
    this.state = { setError: context.actions.setError };
    this.unhandledrejectionHandler = this.unhandledrejectionHandler.bind(this);
    this.eventHandler = this.eventHandler.bind(this);
    this.onErrorHandler = this.onErrorHandler.bind(this);
  }

  // will catch unhandle http error etc
  unhandledrejectionHandler(event) {
    event.preventDefault();
    console.log('Catch reject error:', event.reason.message);
    this.context.actions.setError({
      message: event.reason.message ? event.reason.message : event.reason.stack,
      summary: 'unhandled rejection',
    });
  }

  eventHandler(error) {
    console.log('Catch Error Event：', error);
    this.context.actions.setError({
      message: error.message,
      summary: 'Event Error',
    });
  }

  onErrorHandler(message, source, lineno, colno, error) {
    console.log('Catch Error：', { message, source, lineno, colno, error });
    this.context.actions.setError({
      message: message,
      summary: 'Something went wrong',
    });
    return true;
  }

  componentDidMount() {
    window.onerror = this.onErrorHandler;
    window.addEventListener('unhandledrejection', this.unhandledrejectionHandler, true);
    window.addEventListener('error', this.eventHandler, true);
  }

  // catch all render errors for children components
  componentDidCatch(error) {
    console.log(error);
    this.state.setError({
      message: error.message,
      summary: 'Render Error',
    });
  }

  componentWillUnmount() {
    // set error into null;
    this.context.actions.setError(null);
    window.onerror = null;
    window.removeEventListener('unhandledrejection', this.unhandledrejectionHandler);
    window.removeEventListener('error', this.eventHandler);
  }

  render() {
    const { state, actions } = this.context;
    return (
      <div>
        {state.error ? (
          <ErrorPopup
            error={state.error.message}
            title={state.error.summary}
            onDismiss={() => {
              actions.setError(null);
            }}
          />
        ) : null}
        {this.props.children}
      </div>
    );
  }
}
ErrorBoundary.contextType = StoreContext;
