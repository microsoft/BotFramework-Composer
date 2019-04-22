import React from 'react';

const STAGE = {
  INIT: 0,
  ELEMENT_READY: 1,
  LAYOUT_READY: 2,
};

export class DynamicLayoutComponent extends React.Component {
  renderStage = STAGE.INIT;

  componentDidMount() {
    /**
     * DO NOT simply call forceUpdate() and rely on componentDidUpdate() to maintain the stage.
     * It will mess up children's render stage since mount and update will happen at the same time
     * as a result of React's element reuse.
     */
    this.renderStage = STAGE.ELEMENT_READY;
    this.measureLayout();
    this.renderStage = STAGE.LAYOUT_READY;
    this.forceUpdate();
  }

  componentDidUpdate() {
    switch (this.renderStage) {
      case STAGE.ELEMENT_READY:
        this.measureLayout();
        this.renderStage = STAGE.LAYOUT_READY;
        this.forceUpdate();
        break;
      case STAGE.LAYOUT_READY:
        this.renderStage = STAGE.ELEMENT_READY;
        break;
    }
  }

  measureLayout() {
    throw new Error('measureStyle() is not implemented!');
  }

  computeProps() {
    throw new Error('computeProps() is not implemented!');
  }

  renderContent() {
    throw new Error('renderContent() is not implemented!');
  }

  render() {
    if (this.renderStage !== STAGE.LAYOUT_READY) {
      this.computeProps(this.props);
    }

    return this.renderContent();
  }
}
