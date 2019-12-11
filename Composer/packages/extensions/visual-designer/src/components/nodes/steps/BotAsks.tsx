// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import formatMessage from 'format-message';
import { DialogGroup } from '@bfc/shared';

import { NodeEventTypes } from '../types/NodeEventTypes';
import { NodeColors } from '../../../constants/ElementColors';
import { ElementIcon } from '../../../utils/obiPropertyResolver';
import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../types/nodeProps';
import { useLgTemplate } from '../../../utils/hooks';

export const BotAsks: FC<NodeProps> = ({ id, data, onEvent, renderers: { NodeMenu } }): JSX.Element => {
  const templateText = useLgTemplate(data.prompt, data.$designer && data.$designer.id);

  return (
    <FormCard
      nodeColors={NodeColors[DialogGroup.RESPONSE]}
      icon={ElementIcon.MessageBot}
      header={formatMessage('Bot Asks')}
      corner={<NodeMenu nodeId={id} onEvent={onEvent} />}
      label={templateText || '<prompt>'}
      onClick={() => {
        onEvent(id, NodeEventTypes.ClickNode);
      }}
    />
  );
};
