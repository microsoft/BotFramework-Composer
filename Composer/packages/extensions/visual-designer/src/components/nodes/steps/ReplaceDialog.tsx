// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';

import { NodeEventTypes } from '../types/NodeEventTypes';
import { getElementColor } from '../../../utils/obiPropertyResolver';
import { FormCard } from '../templates/FormCard';
import { NodeProps, defaultNodeProps } from '../types/nodeProps';
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
            onEvent(id, NodeEventTypes.ClickHyperlink, { target: calleeDialog });
          }}
        >
          {calleeDialog}
        </span>
      </span>
    );
  }

  render() {
    const { id, data, onEvent, renderers } = this.props;
    const { NodeMenu } = renderers;
    const nodeColors = getElementColor(data.$type);
    return (
      <FormCard
        nodeColors={nodeColors}
        header={getFriendlyName(data) || 'ReplaceDialog'}
        corner={<NodeMenu nodeId={id} onEvent={onEvent} />}
        label={this.renderCallDialogLink()}
        onClick={() => {
          onEvent(id, NodeEventTypes.ClickNode);
        }}
      />
    );
  }
}
