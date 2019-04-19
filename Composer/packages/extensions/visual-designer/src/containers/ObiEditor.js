import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { obiTransformer } from '../transformers/ObiTransformer';
import { PAYLOAD_KEY, NodeClickActionTypes } from '../utils/constant';
import { NodeRenderer } from '../components/NodeRenderer';

export class ObiEditor extends Component {
  state = {
    prevPath: '',
    focusedId: '',
  };

  static getDerivedStateFromProps(props, state) {
    if (props.path !== state.prevPath) {
      return {
        prevPath: props.path,
        focusedId: '',
      };
    }
    return null;
  }

  dispatchEvent(eventName, eventData) {
    const { onSelect, onExpand, onOpen } = this.props;

    let handler;
    switch (eventName) {
      case NodeClickActionTypes.Focus:
        handler = onSelect;
        break;
      case NodeClickActionTypes.Expand:
        handler = onExpand;
        break;
      case NodeClickActionTypes.OpenLink:
        handler = onOpen;
        break;
      default:
        handler = onSelect;
        break;
    }
    if (this.state.focusedId !== eventData) {
      this.setState({ focusedId: eventData });
    }
    return handler(eventData);
  }

  createRendererInstance(item) {
    const { id, data } = item;
    const { focusedId } = this.state;
    const onEvent = (eventName, eventData) => this.dispatchEvent(eventName, eventData);

    return <NodeRenderer id={id} data={data} focusedId={focusedId} onEvent={onEvent} />;
  }

  buildItemsFromObiJson(data) {
    const selfRenderedItems = obiTransformer
      .toGraphSchema(data)
      .map(x => ({
        id: x.id,
        neighborIds: x.neighborIds,
        data: x[PAYLOAD_KEY],
      }))
      .map(x => {
        const instance = this.createRendererInstance(x);
        x.instance = instance;
        return x;
      });
    return selfRenderedItems;
  }

  render() {
    const graphId = this.props.path + '/ComponentGraph';

    return (
      <div
        className="obi-editor-container"
        data-testid="obi-editor-container"
        style={{ width: '100%', height: '100%' }}
      >
        <NodeRenderer
          key={graphId}
          id={graphId}
          data={this.props.data}
          focusedId={this.state.focusedId}
          onEvent={(...args) => this.dispatchEvent(...args)}
        />
      </div>
    );
  }
}

ObiEditor.defaultProps = {
  path: '.',
  data: {},
  onSelect: () => {},
  onExpand: () => {},
  onOpen: () => {},
};

ObiEditor.propTypes = {
  path: PropTypes.string,
  // Obi raw json
  data: PropTypes.object,
  onSelect: PropTypes.func,
  onExpand: PropTypes.func,
  onOpen: PropTypes.func,
};
