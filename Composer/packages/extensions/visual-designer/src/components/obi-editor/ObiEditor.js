import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DialogFlowEditor } from '../dialog-flow-editor/DialogFlowEditor';
import { ObiTransformer } from '../../utils/obi-transformer';

const obiTransformer = new ObiTransformer();

export class ObiEditor extends Component {
  state = {
    directedGraphItems: [],
    prevObiJson: undefined,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.data !== state.prevObiJson) {
      return {
        directedGraphItems: obiTransformer.toDirectedGraphSchema(props.data),
        prevObiJson: props.data,
      };
    }
  }

  onNodeClicked(nodeContent) {
    console.log('Node clicked:', nodeContent);
  }

  render() {
    const { directedGraphItems } = this.state;
    const { width, height } = this.props;
    return (
      <div className="obi-editor-container">
        <p>Here is your visualized dialog flow.</p>
        <DialogFlowEditor items={directedGraphItems} width={width} height={height} onNodeClick={this.onNodeClicked} />
      </div>
    );
  }
}

ObiEditor.defaultProps = {
  data: {},
  width: 400,
  height: 500,
};

ObiEditor.propTypes = {
  // Obi raw json
  data: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
};
