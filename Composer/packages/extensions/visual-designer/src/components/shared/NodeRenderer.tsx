import React, { FC, ComponentClass, useContext } from 'react';
import classnames from 'classnames';

import { ObiTypes } from '../../shared/ObiTypes';
import {
  DefaultRenderer,
  IntentRule,
  Recognizer,
  BeginDialog,
  ReplaceDialog,
  UnknownIntentRule,
  ConversationUpdateActivityRule,
  EventRule,
  IfCondition,
  SwitchCondition,
  ActivityRenderer,
  Foreach,
  ChoiceInput,
} from '../nodes/index';
import { NodeRendererContext } from '../../store/NodeRendererContext';

import { NodeProps, defaultNodeProps } from './sharedProps';
import './NodeRenderer.css';
import { setDndData, isDndElement } from './dndHelpers';

const rendererByObiType = {
  [ObiTypes.BeginDialog]: BeginDialog,
  [ObiTypes.ConditionNode]: DefaultRenderer,
  [ObiTypes.EventRule]: EventRule,
  [ObiTypes.IfCondition]: IfCondition,
  [ObiTypes.IntentRule]: IntentRule,
  [ObiTypes.LuisRecognizer]: Recognizer,
  [ObiTypes.RegexRecognizer]: Recognizer,
  [ObiTypes.ReplaceDialog]: ReplaceDialog,
  [ObiTypes.SendActivity]: ActivityRenderer,
  [ObiTypes.SwitchCondition]: SwitchCondition,
  [ObiTypes.UnknownIntentRule]: UnknownIntentRule,
  [ObiTypes.ConversationUpdateActivityRule]: ConversationUpdateActivityRule,
  [ObiTypes.Foreach]: Foreach,
  [ObiTypes.ForeachPage]: Foreach,
  [ObiTypes.ChoiceInput]: ChoiceInput,
};
const DEFAULT_RENDERER = DefaultRenderer;

function chooseRendererByType($type): FC<NodeProps> | ComponentClass<NodeProps> {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

export const NodeRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const ChosenRenderer = chooseRendererByType(data.$type);

  const { focusedId } = useContext(NodeRendererContext);
  const nodeFocused = focusedId === id;

  return (
    <div
      className={classnames('node-renderer-container', { 'node-renderer-container--focused': nodeFocused })}
      draggable={true}
      onMouseDown={ev => {
        // 1. DONOT stop the propagation of onMouseUp() event. <Dragscroll /> needs this event to stop dragging.
        // 2. only start a dnd cycle when focus on a element node.
        if (isDndElement(ev.target)) {
          ev.stopPropagation();
        }
      }}
      onDragStart={ev => {
        setDndData(ev, { id, data });
        ev.stopPropagation();
      }}
    >
      <ChosenRenderer
        id={id}
        data={data}
        focused={nodeFocused}
        onEvent={onEvent}
        onResize={size => {
          onResize(size, 'node');
        }}
      />
    </div>
  );
};

NodeRenderer.defaultProps = defaultNodeProps;
