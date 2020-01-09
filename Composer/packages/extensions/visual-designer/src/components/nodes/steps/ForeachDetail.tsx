// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';
import formatMessage from 'format-message';
import { generateSDKTitle } from '@bfc/shared';

import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../nodeProps';
import { getElementIcon, getElementColor } from '../../../utils/obiPropertyResolver';
import { NodeMenu } from '../../menus/NodeMenu';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';

export const ForeachDetail: FC<NodeProps> = ({ id, data, onEvent }) => {
  const { $type } = data;
  const header = formatMessage('Loop: For Each');
  const label = `${formatMessage('Each value in')} {${data.itemsProperty || '?'}}`;

  return (
    <FormCard
      header={generateSDKTitle(data, header)}
      label={label}
      icon={getElementIcon($type)}
      corner={<NodeMenu id={id} onEvent={onEvent} />}
      nodeColors={getElementColor($type)}
      onClick={() => {
        onEvent(NodeEventTypes.Focus, { id });
      }}
    />
  );
};
