import React from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeMenu } from '../shared/NodeMenu';
import { getDialogGroupByType } from '../../shared/appschema';
import { getElementColor } from '../../shared/elementColors';

import { FormCard } from './templates/FormCard';
import { getFriendlyName } from './utils';

export class ReplaceDialog extends React.Component<NodeProps, {}> {
  static defaultProps = defaultNodeProps;
  renderCallDialogLink() {
    const { id, data, onEvent } = this.props;
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
          onEvent(NodeEventTypes.OpenDialog, { caller: id, callee: calleeDialog });
        }}
      >
        Switch to {calleeDialog}
      </span>
    );
  }

  render() {
    const { id, data, onEvent } = this.props;
    const nodeColors = getElementColor(getDialogGroupByType(data.$type));
    return (
      <FormCard
        nodeColors={nodeColors}
        header={getFriendlyName(data) || 'ReplaceDialog'}
        corner={<NodeMenu id={id} onEvent={onEvent} />}
        label={this.renderCallDialogLink()}
        onClick={() => {
          onEvent(NodeEventTypes.Focus, id);
        }}
      />
    );
  }
}
