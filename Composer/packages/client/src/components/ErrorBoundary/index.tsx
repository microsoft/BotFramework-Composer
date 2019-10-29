/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
