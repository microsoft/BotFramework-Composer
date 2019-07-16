/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';

import { Store } from '../../store/index';
import { ErrorPopup } from '../ErrorPopup';

// only class component can be a error boundary
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.addListener();
  }
  unhandledrejectionHandler(event) {
    event.preventDefault();
    console.log('Catch reject error:', event.reason.message);
    this.context.actions.setErrorMsg({
      message: event.reason.message,
      summary: 'unhandled rejection',
    });
  }

  eventHandler(error) {
    console.log('Catch Error Event：', error);
    this.context.actions.setErrorMsg({
      message: error.message,
      summary: 'Event Error',
    });
  }

  addListener() {
    console.log(this.context);
    window.onerror = function(message, source, lineno, colno, error) {
      console.log('Catch Error：', { message, source, lineno, colno, error });
      this.context.actions.setErrorMsg({
        message: message,
        summary: 'Something went wrong',
      });
      return true;
    };
    window.addEventListener('unhandledrejection', this.unhandledrejectionHandler, true);
    window.addEventListener('error', this.eventHandler, true);
  }

  componentDidCatch(error) {
    this.context.actions.setErrorMsg({
      message: error.message,
      summary: 'Something went wrong',
    });
  }

  componentWillUnmount() {
    // set errorMsg into null;
    this.context.actions.setErrorMsg(null);
    window.onerror = null;
    window.removeEventListener('unhandledrejection', this.unhandledrejectionHandler);
    window.removeEventListener('error', this.eventHandler);
  }

  render() {
    return (
      <Store.Consumer>
        {({ state, actions }) => {
          state.errorMsg ? (
            <ErrorPopup
              error={state.errorMsg.message}
              title={state.errorMsg.summary}
              onDismiss={() => {
                actions.setErrorMsg(null);
              }}
            />
          ) : (
            this.props.children
          );
        }}
      </Store.Consumer>
    );
  }
}
ErrorBoundary.contextType = Store;
