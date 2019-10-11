/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import formatMessage from 'format-message';
import { DialogGroup, PromptTab } from 'shared';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { NodeColors } from '../../../constants/ElementColors';
import { ElementIcon } from '../../../utils/obiPropertyResolver';
import { NodeMenu } from '../../menus/NodeMenu';
import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../nodeProps';
import { useLgTemplate } from '../../../utils/hooks';

export const BotAsks: FC<NodeProps> = ({ id, data, onEvent }): JSX.Element => {
  const templateText = useLgTemplate(data.prompt, data.$designer && data.$designer.id);

  return (
    <FormCard
      nodeColors={NodeColors[DialogGroup.RESPONSE]}
      icon={ElementIcon.MessageBot}
      header={formatMessage('Bot Asks')}
      corner={<NodeMenu id={id} onEvent={onEvent} />}
      label={templateText || '<prompt>'}
      onClick={() => {
        onEvent(NodeEventTypes.Focus, { id, tab: PromptTab.BOT_ASKS });
      }}
    />
  );
};
