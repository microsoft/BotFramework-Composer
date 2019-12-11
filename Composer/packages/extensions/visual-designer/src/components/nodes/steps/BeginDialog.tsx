// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

import { NodeEventTypes } from '../types/NodeEventTypes';
import { getElementColor } from '../../../utils/obiPropertyResolver';
import { FormCard } from '../templates/FormCard';
import { NodeProps, defaultNodeProps } from '../types/nodeProps';
import { getFriendlyName } from '../../../utils/adaptive-utils';

export class BeginDialog extends React.Component<NodeProps, object> {
  static defaultProps = defaultNodeProps;
  renderCallDialogLink() {
    const { id, data, onEvent } = this.props;
    if (!data || !data.dialog) return null;

    const calleeDialog = typeof data.dialog === 'object' ? data.dialog.$ref : data.dialog;
    return (
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
    );
  }

  render() {
    const { id, data, onEvent, renderers } = this.props;
    const { NodeMenu } = renderers;
    const nodeColors = getElementColor(data.$type);

    return (
      <FormCard
        nodeColors={nodeColors}
        header={getFriendlyName(data) || 'BeginDialog'}
        corner={<NodeMenu nodeId={id} onEvent={onEvent} />}
        label={this.renderCallDialogLink()}
        onClick={() => {
          onEvent(id, NodeEventTypes.ClickNode);
        }}
      />
    );
  }
}
