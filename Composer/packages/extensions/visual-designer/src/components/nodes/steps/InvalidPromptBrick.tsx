// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';

import { NodeProps } from '../types/nodeProps';
import { NodeEventTypes } from '../types/NodeEventTypes';
import { IconBrick } from '../../decorations/IconBrick';

export const InvalidPromptBrick: FC<NodeProps> = ({ id, onEvent }): JSX.Element => {
  return <IconBrick onClick={() => onEvent(id, NodeEventTypes.ClickNode)} />;
};
