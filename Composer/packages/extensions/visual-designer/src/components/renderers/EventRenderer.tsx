// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC, ComponentClass, useContext } from 'react';
import classnames from 'classnames';

import { ObiTypes } from '../../constants/ObiTypes';
import { NodeRendererContext } from '../../store/NodeRendererContext';
import { IntentRule, ConversationUpdateActivityRule, EventRule, UnknownIntentRule } from '../nodes/index';
import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';

const rendererByObiType = {
  [ObiTypes.OnCondition]: EventRule,
  [ObiTypes.OnIntent]: IntentRule,
  [ObiTypes.OnUnknownIntent]: UnknownIntentRule,
  [ObiTypes.OnConversationUpdateActivity]: ConversationUpdateActivityRule,
};
const DEFAULT_RENDERER = UnknownIntentRule;

function chooseRendererByType($kind): FC<NodeProps> | ComponentClass<NodeProps> {
  const renderer = rendererByObiType[$kind] || DEFAULT_RENDERER;
  return renderer;
}

const nodeBorderStyle = css`
  outline: 2px solid grey;
`;

export const EventRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const ChosenRenderer = chooseRendererByType(data.$kind);

  const { focusedId, focusedEvent } = useContext(NodeRendererContext);
  const nodeFocused = focusedId === id || focusedEvent === id;

  return (
    <div
      className={classnames('event-renderer-container', { 'event-renderer-container--focused': nodeFocused })}
      css={css`
        display: inline-block;
        position: relative;
        ${nodeFocused && nodeBorderStyle}
      `}
    >
      <ChosenRenderer
        data={data}
        focused={nodeFocused}
        id={id}
        onEvent={onEvent}
        onResize={(size) => {
          onResize(size, 'node');
        }}
      />
    </div>
  );
};

EventRenderer.defaultProps = defaultNodeProps;
