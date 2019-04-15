import React from 'react';

import { ObiTypes } from '../transformers/constants/ObiTypes';
import { EventGroup, IntentGroup } from '../components/groups';
import {
  DefaultRenderer,
  WelcomeRule,
  IntentRule,
  Recognizer,
  BeginDialog,
  NoMatchRule,
  EventRule,
  IfCondition,
} from '../components/nodes/index';

const rendererByObiType = {
  [ObiTypes.WelcomeRule]: WelcomeRule,
  [ObiTypes.IntentRule]: IntentRule,
  [ObiTypes.NoMatchRule]: NoMatchRule,
  [ObiTypes.RegexRecognizer]: Recognizer,
  [ObiTypes.LuisRecognizer]: Recognizer,
  [ObiTypes.BeginDialog]: BeginDialog,
  [ObiTypes.EventRule]: EventRule,
  [ObiTypes.IfCondition]: IfCondition,
  // groups
  [ObiTypes.EventGroup]: EventGroup,
  [ObiTypes.IntentGroup]: IntentGroup,
};
const DEFAULT_RENDERER = DefaultRenderer;

function chooseRendererByType($type) {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

export function NodeRenderer({ id, data, focusedId, onEvent }) {
  const ChosenRenderer = chooseRendererByType(data.$type);

  const nodeContent = <ChosenRenderer id={id} data={data} focusedId={focusedId} onEvent={onEvent} />;
  if (focusedId === id) {
    return <div style={{ outline: '2px solid grey' }}>{nodeContent}</div>;
  }
  return nodeContent;
}
