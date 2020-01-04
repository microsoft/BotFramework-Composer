// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { generateSDKTitle } from '@bfc/shared';

import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../nodeProps';
import { getElementIcon, getElementColor } from '../../../utils/obiPropertyResolver';
import { NodeMenu } from '../../menus/NodeMenu';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';

export const ForeachPageDetail: FC<NodeProps> = ({ id, data, onEvent }) => {
  const { $type } = data;

  const header = formatMessage('Loop: For Each Page');
  const pageSizeString = get(data, 'pageSize', '?');
  const propString = get(data, 'itemsProperty', '?');
  const label = `${formatMessage('Each page of')} ${pageSizeString} ${formatMessage('in')} {${propString}}`;

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
