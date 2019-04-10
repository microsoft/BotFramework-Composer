import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DirectedGraph } from 'cci-graph-lib';
import createReactClass from 'create-react-class';

export class ComponentGraph extends Component {
  key = 0;

  toGraphLibSchema(item) {
    const { id, neighborIds, instance } = item;
    return {
      id,
      neighborIds,
      // eslint-disable-next-line react/display-name
      contentRenderer: createReactClass({
        render: () => instance,
      }),
      footerRenderer: null,
    };
  }

  render() {
    const { items } = this.props;

    // TODO: draw minimap, toolbars
    if (items && items.length > 0) {
      const graphNodes = items.map(x => this.toGraphLibSchema(x));
      return <DirectedGraph key={++this.key} items={graphNodes} />;
    }
    return null;
  }
}

ComponentGraph.defaultProps = {
  items: [],
};

ComponentGraph.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      neighborIds: PropTypes.arrayOf(PropTypes.string),
      instance: PropTypes.any,
    })
  ),
};
