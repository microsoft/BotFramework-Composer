/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import formatMessage from 'format-message';
import { DialogGroup } from 'shared-menus';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { NodeColors } from '../../../constants/ElementColors';
import { NodeMenu } from '../../menus/NodeMenu';
import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../nodeProps';

export const BotAsks: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  return (
    <FormCard
      nodeColors={NodeColors[DialogGroup.RESPONSE]}
      icon={'MessageBot'}
      header={formatMessage('Bot Asks')}
      corner={<NodeMenu id={id} onEvent={onEvent} />}
      label={data.prompt || '<prompt>'}
      onClick={() => {
        onEvent(NodeEventTypes.Focus, id);
      }}
    />
  );
};
