// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { generateSDKTitle } from '@bfc/shared';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { getElementColor } from '../../../utils/obiPropertyResolver';
import { NodeMenu } from '../../menus/NodeMenu';
import { FormCard } from '../templates/FormCard';
import { NodeProps, defaultNodeProps } from '../nodeProps';

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
    const header = formatMessage('ReplaceDialog');
    return (
      <FormCard
        header={generateSDKTitle(data, header)}
        label={this.renderCallDialogLink()}
        corner={<NodeMenu id={id} onEvent={onEvent} />}
        nodeColors={nodeColors}
        onClick={() => {
          onEvent(NodeEventTypes.Focus, { id });
        }}
      />
    );
  }
}
