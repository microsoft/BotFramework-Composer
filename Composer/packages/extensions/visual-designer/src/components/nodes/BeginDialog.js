import React from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeMenu } from '../shared/NodeMenu';
import { getDialogGroupByType } from '../../shared/appschema';
import { getElementColor } from '../../shared/elementColors';

import { FormCard } from './templates/FormCard';
import { getFriendlyName } from './utils';

export class BeginDialog extends React.Component {
  renderCallDialogLink() {
    const { data, onEvent } = this.props;
    if (!data || !data.dialog) return null;

    const calleeDialog = typeof data.dialog === 'object' ? data.dialog.$ref : data.dialog;
    return (
      <span
        style={{
          cursor: 'pointer',
          color: 'blue',
        }}
        onClick={e => {
          e.stopPropagation();
          onEvent(NodeEventTypes.OpenLink, calleeDialog);
        }}
      >
        {calleeDialog}
      </span>
    );
  }

  render() {
    const { id, data, onEvent } = this.props;
    const nodeColors = getElementColor(getDialogGroupByType(data.$type));
    return (
      <FormCard
        nodeColors={nodeColors}
        header={getFriendlyName(data) || 'BeginDialog'}
        corner={<NodeMenu id={id} onEvent={onEvent} />}
        label={this.renderCallDialogLink()}
        onClick={() => {
          onEvent(NodeEventTypes.Focus, id);
        }}
      />
    );
  }
}

BeginDialog.propTypes = NodeProps;
BeginDialog.defaultProps = defaultNodeProps;
