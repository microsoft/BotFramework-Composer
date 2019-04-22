import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { NodeClickActionTypes } from '../shared/NodeClickActionTypes';
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
          expanded={true}
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
