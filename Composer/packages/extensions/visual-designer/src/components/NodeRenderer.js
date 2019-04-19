import React from 'react';
import PropTypes from 'prop-types';

import { ObiTypes } from '../transformers/constants/ObiTypes';

import { AdaptiveDialog, EventGroup, IntentGroup, IfCondition, StepGroup } from './groups';
import {
  DefaultRenderer,
  WelcomeRule,
  IntentRule,
  Recognizer,
  BeginDialog,
  NoMatchRule,
  EventRule,
} from './nodes/index';

const rendererByObiType = {
  [ObiTypes.AdaptiveDialog]: AdaptiveDialog,
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
  [ObiTypes.StepGroup]: StepGroup,
};
const DEFAULT_RENDERER = DefaultRenderer;

function chooseRendererByType($type) {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

export const NodeRenderer = React.forwardRef(function RefNodeRenderer(props, ref) {
  const { id, data, focusedId, onEvent } = props;
  const ChosenRenderer = chooseRendererByType(data.$type);

  return (
    <div
      className="node-renderer-container"
      style={{ position: 'absolute', outline: focusedId === id ? '2px solid grey' : null, display: 'inline-block' }}
      ref={ref}
    >
      <ChosenRenderer id={id} data={data} focusedId={focusedId} onEvent={onEvent} />
    </div>
  );
});

NodeRenderer.propTypes = {
  id: PropTypes.string,
  data: PropTypes.any,
  focusedId: PropTypes.string,
  onEvent: PropTypes.func,
};
