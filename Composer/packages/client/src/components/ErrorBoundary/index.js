/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';

import { ErrorPopup } from '../ErrorPopup/index';

// only class component can be a error boundary
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, info: '', title: '' };
    this.reset = this.reset.bind(this);
  }

  componentDidCatch(error) {
    this.setState({ hasError: true, info: error.message, title: error.name });
  }

  reset() {
    this.setState({ hasError: false, info: '', title: '' }, window.history.back());
  }

  render() {
    const { hasError, info, title } = this.state;
    return (
      <div>{hasError ? <ErrorPopup title={title} error={info} onDismiss={this.reset} /> : this.props.children}</div>
    );
  }
}
