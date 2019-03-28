import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DialogFlowEditor } from '../dialog-flow-editor/DialogFlowEditor';
import { obiTransformer } from '../../transformers/ObiTransformer';

export class ObiEditor extends Component {
  state = {
    directedGraphItems: [],
    prevObiJson: undefined,
  };

  bubbleNodeClickEvent(nodeContent) {
    this.props.onClickDialog(nodeContent);
  }

  render() {
    const { width, height, data } = this.props;
    const directedGraphItems = obiTransformer.toDirectedGraphSchema(data);

    return (
      <div
        className="obi-editor-container"
        data-testid="obi-editor-container"
        style={{ width: '100%', height: '100%' }}
      >
        <DialogFlowEditor
          items={directedGraphItems}
          width={width}
          height={height}
          onNodeClick={payload => this.bubbleNodeClickEvent(payload)}
        />
      </div>
    );
  }
}

ObiEditor.defaultProps = {
  data: {},
  onClickDialog: () => {},
};

ObiEditor.propTypes = {
  // Obi raw json
  data: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  onClickDialog: PropTypes.func,
};
