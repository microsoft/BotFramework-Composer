// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { generateSDKTitle } from '@bfc/shared';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { getElementColor, ElementIcon } from '../../../utils/obiPropertyResolver';
import { NodeMenu } from '../../menus/NodeMenu';
import { FormCard } from '../templates/FormCard';
import { NodeProps, defaultNodeProps } from '../nodeProps';
import { useLgTemplate } from '../../../utils/hooks';

export const ActivityRenderer: React.FC<NodeProps> = props => {
  const { id, data, onEvent } = props;
  const templateText = useLgTemplate(data.activity, data.$designer && data.$designer.id);

  const nodeColors = getElementColor(data.$type);
  const header = formatMessage('Activity');
  return (
    <FormCard
      header={generateSDKTitle(data, header)}
      label={templateText}
      icon={ElementIcon.MessageBot}
      corner={<NodeMenu id={id} onEvent={onEvent} />}
      nodeColors={nodeColors}
      onClick={() => {
        onEvent(NodeEventTypes.Focus, { id });
      }}
    />
  );
};

ActivityRenderer.defaultProps = defaultNodeProps;
