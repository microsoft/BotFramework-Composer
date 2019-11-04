// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Icon as FabricIcon } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { getElementColor } from '../../../utils/obiPropertyResolver';
import { NodeMenu } from '../../menus/NodeMenu';
import { FormCard } from '../templates/FormCard';
import { NodeProps, defaultNodeProps } from '../nodeProps';
import { getFriendlyName } from '../utils';

export class ReplaceDialog extends React.Component<NodeProps, {}> {
  static defaultProps = defaultNodeProps;
  renderCallDialogLink() {
    const { id, data, onEvent } = this.props;
    if (!data || !data.dialog) return null;

    const calleeDialog = typeof data.dialog === 'object' ? data.dialog.$ref : data.dialog;
    return (
      <span>
        {formatMessage('Switch to ')}
        <span
          css={{
            cursor: 'pointer',
            color: 'blue',
          }}
          onClick={e => {
            e.stopPropagation();
            onEvent(NodeEventTypes.OpenDialog, { caller: id, callee: calleeDialog });
          }}
        >
          {calleeDialog}
        </span>
      </span>
    );
  }

  render() {
    const { id, data, onEvent } = this.props;
    const nodeColors = getElementColor(data.$type);
    return (
      <FormCard
        nodeColors={nodeColors}
        header={getFriendlyName(data) || 'ReplaceDialog'}
        corner={<NodeMenu id={id} onEvent={onEvent} />}
        label={this.renderCallDialogLink()}
        onClick={() => {
          onEvent(NodeEventTypes.Focus, { id });
        }}
      />
    );
  }
}
