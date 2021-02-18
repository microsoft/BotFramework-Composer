// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { Component } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class WebChatErrorBoundary extends Component<ErrorBoundaryProps> {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  componentDidMount() {
    window.addEventListener('unhandledrejection', this.unhandledrejectionHandler, true);
  }

  unhandledrejectionHandler(event) {
    debugger;
    event.preventDefault();
    console.error(event.reason);
  }

  componentDidCatch(error) {
    this.setState({
      hasError: true,
    });

    if (error instanceof Promise) {
      error.then(() => console.log(error));
    } else {
      console.log(error);
    }
  }

  render() {
    return this.props.children;
  }
}
