/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';
import formatMessage from 'format-message';

import { StoreContext } from '../../store';
import { ErrorPopup } from '../ErrorPopup';

const githubIssueUrl = `https://github.com/microsoft/BotFramework-Composer/issues`;
const errorToShow = {
  message: formatMessage.rich('If this problem persists, please file an issue on <a>GitHub</a>.', {
    // eslint-disable-next-line react/display-name
    a: ({ children }) => (
      <a key="a" href={githubIssueUrl} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  }),
  summary: formatMessage('Something went wrong!'),
};
// only class component can be a error boundary
export class ErrorBoundary extends Component {
  constructor(props, context) {
    super(props);
    this.state = { setError: context.actions.setError };
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
    this.state.setError(errorToShow);
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
