/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';

import { Store } from '../../store/index';
import { ErrorPopup } from '../ErrorPopup';

// only class component can be a error boundary
export class ErrorBoundary extends Component {
  constructor(props, context) {
    super(props);
    this.state = { setError: context.actions.setError };
    this.unhandledrejectionHandler = this.unhandledrejectionHandler.bind(this);
    this.eventHandler = this.eventHandler.bind(this);
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

  componentDidMount() {
    window.onerror = function(message, source, lineno, colno, error) {
      console.log('Catch Error：', { message, source, lineno, colno, error });
      this.context.actions.setError({
        message: message,
        summary: 'Something went wrong',
      });
      return true;
    };
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
    return state.error ? (
      <ErrorPopup
        error={state.error.message}
        title={state.error.summary}
        onDismiss={() => {
          actions.setError(null);
        }}
      />
    ) : (
      this.props.children
    );
  }
}
ErrorBoundary.contextType = Store;
