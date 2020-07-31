// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable format-message/literal-pattern */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable no-console */
import React, { Component } from 'react';
import formatMessage from 'format-message';

import { StateError } from '../recoilModel/types';

import { ErrorPopup } from './ErrorPopup/ErrorPopup';

const githubIssueUrl = `https://github.com/microsoft/BotFramework-Composer/issues`;
const genericErrorTitle = 'Something went wrong!';

const errorToShow = (error: any): StateError => {
  const msg: string = typeof error === 'string' ? error : error?.message || error?.detail;
  let messageHtml = 'If this problem persists, please file an issue on <a>GitHub</a>';
  if (msg) {
    messageHtml += `<details>${msg}</details>`;
  }
  const summary: string = msg ? msg.substring(0, 20) + '...' : genericErrorTitle;

  return {
    message: formatMessage.rich(messageHtml, {
      // eslint-disable-next-line react/display-name
      a: ({ children }) => (
        <a key="a" href={githubIssueUrl} rel="noopener noreferrer" style={{ color: `greenyellow` }} target="_blank">
          {children}
        </a>
      ),
      details: ({ children }) => <details style={{ whiteSpace: 'pre-wrap' }}>{children}</details>,
    }),
    summary: formatMessage(summary),
  };
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fetchProject: () => void;
  currentApplicationError: StateError | undefined;
  setApplicationLevelError: (errorObj: StateError | undefined) => void;
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
    this.unhandledrejectionHandler = this.unhandledrejectionHandler.bind(this);
    this.eventHandler = this.eventHandler.bind(this);
    this.onErrorHandler = this.onErrorHandler.bind(this);
  }

  // will catch unhandle http error etc
  unhandledrejectionHandler(event) {
    event.preventDefault();
    console.error(event.reason);
    this.props.setApplicationLevelError(errorToShow(event));
  }

  eventHandler(error) {
    console.error(error);
    this.props.setApplicationLevelError(errorToShow(error));
  }

  onErrorHandler(message, source, lineno, colno, error) {
    console.error({ message, source, lineno, colno, error });
    this.props.setApplicationLevelError(errorToShow(message));
    return true;
  }

  componentDidMount() {
    window.onerror = this.onErrorHandler;
    window.addEventListener('unhandledrejection', this.unhandledrejectionHandler, true);
    window.addEventListener('error', this.eventHandler, true);
  }

  // catch all render errors for children components
  componentDidCatch(error, errorInfo) {
    console.error(error);
    console.error(errorInfo);
    this.props.setApplicationLevelError(errorToShow(error));
  }

  componentWillUnmount() {
    // set error into null;
    this.props.setApplicationLevelError(undefined);
    window.onerror = null;
    window.removeEventListener('unhandledrejection', this.unhandledrejectionHandler);
    window.removeEventListener('error', this.eventHandler);
  }

  closeErrorPopup() {
    // if this is an error resulting in an http 409 rejection, reload the project data automatically.
    if (this.props.currentApplicationError?.status === 409) {
      this.props.fetchProject();
    }
    // reset the error state which will close the popup.
    this.props.setApplicationLevelError(undefined);
  }

  render() {
    const { currentApplicationError } = this.props;
    return (
      <div>
        {currentApplicationError ? (
          <ErrorPopup
            error={currentApplicationError?.message}
            title={currentApplicationError?.summary}
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
