import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { SimpleGraph } from 'cci-graph-lib';

export class DialogFlowEditor extends Component {
  render() {
    const { items, width, height } = this.props;
    return <SimpleGraph items={items} width={width} height={height} />;
  }

  setDialogNode(dagreGraph, node) {
    dagreGraph.setNode(node.id, { label: node.name });
  }

  setPipelineEdge(dagreGraph, edge) {
    dagreGraph.setEdge(edge.from, edge.to, {
      arrowhead: edge.arrowhead,
      label: edge.name,
    });
  }
}

DialogFlowEditor.defaultProps = {
  items: [],
  width: 400,
  height: 600,
};

// TODO: configure a babel transformer for in-class props validation.
DialogFlowEditor.propTypes = {
  // TODO: define concrete schema. (TSX required)
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
};
