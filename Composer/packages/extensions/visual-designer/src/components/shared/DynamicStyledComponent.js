import React from 'react';

const FLAGS = {
  ELEMENT: 0,
  LAYOUT: 1,
};

export class DynamicStyledComponent extends React.Component {
  renderStage = FLAGS.ELEMENT;

  componentDidMount() {
    this.forceUpdate();
  }

  componentDidUpdate() {
    switch (this.renderStage) {
      case FLAGS.ELEMENT:
        this.renderStage = FLAGS.LAYOUT;
        this.updateDOMStyle();
        this.forceUpdate();
        break;
      case FLAGS.LAYOUT:
        this.renderStage = FLAGS.ELEMENT;
        break;
    }
  }

  updateDOMStyle() {
    throw new Error('updateDOMStyle() is not implemented!');
  }

  computeProps() {
    throw new Error('computeProps() is not implemented!');
  }

  renderContent() {
    throw new Error('renderContent() is not implemented!');
  }

  render() {
    if (this.renderStage === FLAGS.ELEMENT) {
      this.computeProps(this.props);
    }

    return this.renderContent();
  }
}
