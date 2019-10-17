import React from 'react';
import { createPortal } from 'react-dom';

export class ToolBarPortal extends React.Component {
  constructor() {
    super();
    this.root = document.getElementById('toolbar-portal');
    this.el = document.createElement('div');
  }

  componentDidMount = () => {
    this.root.appendChild(this.el);
  };

  componentWillUnmount = () => {
    this.root.removeChild(this.el);
  };

  render() {
    const { children } = this.props;
    return createPortal(children, this.el);
  }
}
