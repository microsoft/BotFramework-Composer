import React from 'react';

const STAGE = {
  ELEMENT: 0,
  STYLE: 1,
};

export class DynamicStyledComponent extends React.Component {
  renderStage = STAGE.ELEMENT;

  componentDidMount() {
    this.forceUpdate();
  }

  componentDidUpdate() {
    switch (this.renderStage) {
      case STAGE.ELEMENT:
        this.renderStage = STAGE.STYLE;
        this.measureStyle();
        this.forceUpdate();
        break;
      case STAGE.STYLE:
        this.renderStage = STAGE.ELEMENT;
        break;
    }
  }

  measureStyle() {
    throw new Error('measureStyle() is not implemented!');
  }

  computeProps() {
    throw new Error('computeProps() is not implemented!');
  }

  renderContent() {
    throw new Error('renderContent() is not implemented!');
  }

  render() {
    if (this.renderStage === STAGE.ELEMENT) {
      this.computeProps(this.props);
    }

    return this.renderContent();
  }
}
