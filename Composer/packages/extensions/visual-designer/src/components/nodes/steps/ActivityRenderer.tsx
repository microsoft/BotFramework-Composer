import React from 'react';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { getElementColor, ElementIcon } from '../../../utils/obiPropertyResolver';
import { NodeMenu } from '../../menus/NodeMenu';
import { FormCard } from '../templates/FormCard';
import { NodeProps, defaultNodeProps } from '../nodeProps';
import { getFriendlyName } from '../utils';
import { useLgTemplate } from '../../../utils/hooks';

export const ActivityRenderer: React.FC<NodeProps> = props => {
  const { id, data, onEvent } = props;
  const templateText = useLgTemplate(data.activity, data.$designer && data.$designer.id);

  const nodeColors = getElementColor(data.$type);

  return (
    <FormCard
      nodeColors={nodeColors}
      header={getFriendlyName(data) || 'Activity'}
      corner={<NodeMenu id={id} onEvent={onEvent} />}
      icon={ElementIcon.MessageBot}
      label={templateText}
      onClick={() => {
        onEvent(NodeEventTypes.Focus, { id });
      }}
    />
  );
};

ActivityRenderer.defaultProps = defaultNodeProps;
