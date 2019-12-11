// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { NodeEventTypes } from '../types/NodeEventTypes';
import { getElementColor, ElementIcon } from '../../../utils/obiPropertyResolver';
import { FormCard } from '../templates/FormCard';
import { NodeProps, defaultNodeProps } from '../types/nodeProps';
import { getFriendlyName } from '../utils';
import { useLgTemplate } from '../../../utils/hooks';

export const ActivityRenderer: React.FC<NodeProps> = props => {
  const { id, data, onEvent, renderers } = props;
  const { NodeMenu } = renderers;
  const templateText = useLgTemplate(data.activity, data.$designer && data.$designer.id);
  const nodeColors = getElementColor(data.$type);

  return (
    <FormCard
      nodeColors={nodeColors}
      header={getFriendlyName(data) || 'Activity'}
      corner={<NodeMenu nodeId={id} onEvent={onEvent} />}
      icon={ElementIcon.MessageBot}
      label={templateText}
      onClick={() => {
        onEvent(id, NodeEventTypes.ClickNode);
      }}
    />
  );
};

ActivityRenderer.defaultProps = defaultNodeProps;
