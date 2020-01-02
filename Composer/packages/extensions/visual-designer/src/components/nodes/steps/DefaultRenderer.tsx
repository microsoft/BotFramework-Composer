// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';

import { NodeProps } from '../nodeProps';
import { renderSDKType } from '../../../schema/uischemaRenderer';
import { NodeMenu } from '../../menus/NodeMenu';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';

export const DefaultRenderer: FC<NodeProps> = ({ id, data, onEvent }) => {
  return renderSDKType(data, {
    menu: <NodeMenu id={id} onEvent={onEvent} />,
    onClick: () => onEvent(NodeEventTypes.Focus, { id }),
  });
};
