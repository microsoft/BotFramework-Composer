/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Icon as FabricIcon } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { NodeEventTypes } from '../../../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../../shared/sharedProps';
import { NodeMenu } from '../../menus/NodeMenu';
import { getDialogGroupByType } from '../../../shared/appschema';
import { getElementColor } from '../shared/elementColors';
import { FormCard } from '../templates/FormCard';
import { getFriendlyName } from '../utils';

export class ReplaceDialog extends React.Component<NodeProps, {}> {
  static defaultProps = defaultNodeProps;
  renderCallDialogLink() {
    const { id, data, onEvent } = this.props;
    if (!data || !data.dialog) return null;

    const calleeDialog = typeof data.dialog === 'object' ? data.dialog.$ref : data.dialog;
    return (
      <span>
        {formatMessage('Switch to')}
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
          <FabricIcon
            style={{ lineHeight: '12px', fontSize: '12px', paddingLeft: '5px', paddingRight: '5px' }}
            iconName="OpenSource"
            data-testid="OpenIcon"
          />
          {calleeDialog}
        </span>
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
