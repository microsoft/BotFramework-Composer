import React from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeMenu } from '../shared/NodeMenu';

import { FormCard } from './templates/FormCard';
import { getFriendlyName } from './utils';

export class ReplaceDialog extends React.Component {
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
    return (
      <FormCard
        themeColor="#107C10"
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

ReplaceDialog.propTypes = NodeProps;
ReplaceDialog.defaultProps = defaultNodeProps;
