// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable format-message/literal-pattern */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable no-console */
import React, { Component } from 'react';

import { StateError } from '../recoilModel/types';

import { ErrorPopup } from './ErrorPopup/ErrorPopup';

const genericErrorTitle = 'Something went wrong!';

const formatToStateError = (error: any): StateError => {
  const message: string = typeof error === 'string' ? error : error?.message || error?.detail;
  const summary: string = message || genericErrorTitle;
  return {
    message,
    summary,
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
    this.props.setApplicationLevelError(formatToStateError(event));
  }

  eventHandler(error) {
    console.error(error);
    this.props.setApplicationLevelError(formatToStateError(error));
  }

  onErrorHandler(message, source, lineno, colno, error) {
    console.error({ message, source, lineno, colno, error });
    this.props.setApplicationLevelError(formatToStateError(message));
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
    this.props.setApplicationLevelError(formatToStateError(error));
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
            error={currentApplicationError}
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
