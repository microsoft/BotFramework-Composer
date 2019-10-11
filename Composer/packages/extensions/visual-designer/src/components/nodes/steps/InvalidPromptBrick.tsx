/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { PromptTab } from 'shared';

import { NodeProps } from '../nodeProps';
import { IconBrick } from '../../decorations/IconBrick';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';

export const InvalidPromptBrick: FC<NodeProps> = ({ id, onEvent }): JSX.Element => {
  return <IconBrick onClick={() => onEvent(NodeEventTypes.Focus, { id, tab: PromptTab.EXCEPTIONS })} />;
};
