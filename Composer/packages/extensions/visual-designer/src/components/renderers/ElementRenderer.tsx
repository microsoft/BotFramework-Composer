/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC, ComponentClass, useContext } from 'react';
import classnames from 'classnames';

import { ObiTypes } from '../../constants/ObiTypes';
import { NodeRendererContext } from '../../store/NodeRendererContext';
import { SelectionContext } from '../../store/SelectionContext';
import { DefaultRenderer, Recognizer, BeginDialog, ReplaceDialog, ActivityRenderer, ChoiceInput } from '../nodes/index';
import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';

const rendererByObiType = {
  [ObiTypes.BeginDialog]: BeginDialog,
  [ObiTypes.ConditionNode]: DefaultRenderer,
  [ObiTypes.LuisRecognizer]: Recognizer,
  [ObiTypes.RegexRecognizer]: Recognizer,
  [ObiTypes.ReplaceDialog]: ReplaceDialog,
  [ObiTypes.SendActivity]: ActivityRenderer,
  [ObiTypes.ChoiceInputDetail]: ChoiceInput,
};
const DEFAULT_RENDERER = DefaultRenderer;

function chooseRendererByType($type): FC<NodeProps> | ComponentClass<NodeProps> {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

const nodeBorderHoveredStyle = css`
  outline: 1px solid #323130;
`;

const nodeBorderSelectedStyle = css`
  outline: 1px solid #0078d4;
`;

export const ElementRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const ChosenRenderer = chooseRendererByType(data.$type);

  const { focusedId, focusedEvent } = useContext(NodeRendererContext);
  const { getNodeIndex, selectedIds } = useContext(SelectionContext);
  const nodeFocused = focusedId === id || focusedEvent === id;
  const nodeSelected = selectedIds.includes(id);

  return (
    <div
      className={classnames(
        'step-renderer-container',
        { 'step-renderer-container--focused': nodeFocused },
        { 'step-renderer-container--selected': nodeSelected }
      )}
      css={css`
        display: inline-block;
        position: relative;
        ${nodeFocused && nodeBorderSelectedStyle};
        ${nodeSelected && nodeBorderSelectedStyle};
        &:hover {
          ${!nodeFocused && !nodeSelected && nodeBorderHoveredStyle}
        }
      `}
      data-is-focusable={true}
      data-selection-index={getNodeIndex(id)}
    >
      <ChosenRenderer
        id={id}
        data={data}
        focused={nodeFocused}
        onEvent={onEvent}
        onResize={size => {
          onResize(size, 'element');
        }}
      />
    </div>
  );
};

ElementRenderer.defaultProps = defaultNodeProps;
