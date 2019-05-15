import React from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { FormCard } from './templates/FormCard';
import { getFriendlyName } from './utils';
import { NodeMenu } from './templates/NodeMenu';

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
          onEvent(NodeClickActionTypes.OpenLink, calleeDialog);
        }}
      >
        {calleeDialog}
      </span>
    );
  }

  render() {
    const { id, data, onEvent } = this.props;
    return (
      <FormCard
        themeColor="#107C10"
        header={getFriendlyName(data) || 'BeginDialog'}
        corner={<NodeMenu onEvent={e => onEvent(e, id)} />}
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
