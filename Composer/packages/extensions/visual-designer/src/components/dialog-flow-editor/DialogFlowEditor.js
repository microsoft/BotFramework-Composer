import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DirectedGraph } from 'cci-graph-lib';

import './DialogFlowEditor.css';
import { DialogNode } from './DialogNode';

export class DialogFlowEditor extends Component {
  bindItemAttributes(item) {
    return {
      ...item,
      contentRenderer: DialogNode,
      footerRenderer: null,
      onClick: this.props.onNodeClick,
    };
  }

  render() {
    const { items, width, height } = this.props;

    if (items && items.length > 0) {
      const graphNodes = items.map(x => this.bindItemAttributes(x));
      return <DirectedGraph items={graphNodes} width={width} height={height} />;
    }
    return null;
  }
}

DialogFlowEditor.defaultProps = {
  items: [],
  width: 400,
  height: 600,
  onNodeClick: () => {},
};

// TODO: configure a babel transformer for in-class props validation.
DialogFlowEditor.propTypes = {
  // TODO: define concrete schema. (TSX required)
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
};
