// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable no-console */
import React, { Component } from 'react';
import formatMessage from 'format-message';

import { StoreContext } from '../../store';
import { ErrorPopup } from '../ErrorPopup';

const githubIssueUrl = `https://github.com/microsoft/BotFramework-Composer/issues`;
const errorToShow = {
  message: formatMessage.rich('If this problem persists, please file an issue on <a>GitHub</a>.', {
    // eslint-disable-next-line react/display-name
    a: ({ children }) => (
      <a key="a" href={githubIssueUrl} target="_blank" rel="noopener noreferrer" style={{ color: `greenyellow` }}>
        {children}
      </a>
    ),
  }),
  summary: formatMessage('Something went wrong!'),
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: {
    message?: React.ReactNode;
    summary?: string;
    status?: number;
  };
}

// only class component can be a error boundary
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: {} };
    this.unhandledrejectionHandler = this.unhandledrejectionHandler.bind(this);
    this.eventHandler = this.eventHandler.bind(this);
    this.onErrorHandler = this.onErrorHandler.bind(this);
  }

  // will catch unhandle http error etc
  unhandledrejectionHandler(event) {
    event.preventDefault();
    console.error(event.reason);
    this.context.actions.setError(errorToShow);
  }

  eventHandler(error) {
    console.error(error);
    this.context.actions.setError(errorToShow);
  }

  onErrorHandler(message, source, lineno, colno, error) {
    console.error({ message, source, lineno, colno, error });
    this.context.actions.setError(errorToShow);
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
    this.context.actions.setError(errorToShow);
  }

  componentWillUnmount() {
    // set error into null;
    this.context.actions.setError(null);
    window.onerror = null;
    window.removeEventListener('unhandledrejection', this.unhandledrejectionHandler);
    window.removeEventListener('error', this.eventHandler);
  }

  closeErrorPopup() {
    // if this is an error resulting in an http 409 rejection, reload the project data automatically.
    if (this.context.state.error && this.context.state.error.status && this.context.state.error.status === 409) {
      this.context.actions.fetchProject();
    }
    // reset the error state which will close the popup.
    this.context.actions.setError(null);
  }

  render() {
    const { state } = this.context;
    return (
      <div>
        {state.error ? (
          <ErrorPopup
            error={state.error.message}
            title={state.error.summary}
            onDismiss={() => {
              this.closeErrorPopup();
            }}
          />
        ) : null}
        {this.props.children}
      </div>
    );
  }
}
ErrorBoundary.contextType = StoreContext;
