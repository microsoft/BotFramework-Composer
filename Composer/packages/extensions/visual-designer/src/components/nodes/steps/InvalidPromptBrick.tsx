// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { PromptTab } from '@bfc/shared';

import { NodeProps } from '../nodeProps';
import { IconBrick } from '../../decorations/IconBrick';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';

export const InvalidPromptBrick: FC<NodeProps> = ({ id, onEvent }): JSX.Element => {
  return <IconBrick onClick={() => onEvent(NodeEventTypes.Focus, { id, tab: PromptTab.OTHER })} />;
};
