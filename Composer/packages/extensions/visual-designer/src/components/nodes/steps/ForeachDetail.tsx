// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';

import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../nodeProps';
import { getElementIcon, getElementColor } from '../../../utils/obiPropertyResolver';
import { NodeMenu } from '../../menus/NodeMenu';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';

export const ForeachDetail: FC<NodeProps> = ({ id, data, onEvent }) => {
  const { $type } = data;
  const label = `Each value in {${data.itemsProperty || '?'}}`;

  return (
    <FormCard
      nodeColors={getElementColor($type)}
      icon={getElementIcon($type)}
      corner={<NodeMenu id={id} onEvent={onEvent} />}
      header={'Loop: For Each'}
      label={label}
      onClick={() => {
        onEvent(NodeEventTypes.Focus, { id });
      }}
    />
  );
};
