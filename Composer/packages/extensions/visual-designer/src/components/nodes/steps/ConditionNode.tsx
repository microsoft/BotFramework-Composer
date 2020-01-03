// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';
import get from 'lodash/get';
import formatMessage from 'format-message';

import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../nodeProps';
import { getElementIcon, getElementColor } from '../../../utils/obiPropertyResolver';
import { NodeMenu } from '../../menus/NodeMenu';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';

export const ConditionNode: FC<NodeProps> = ({ id, data, onEvent }) => {
  const { $type } = data;

  return (
    <FormCard
      header={formatMessage('Branch')}
      label={get(data, 'condition', '')}
      icon={getElementIcon($type)}
      corner={<NodeMenu id={id} onEvent={onEvent} />}
      nodeColors={getElementColor($type)}
      onClick={() => {
        onEvent(NodeEventTypes.Focus, { id });
      }}
    />
  );
};
