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

export class NodeRenderer extends React.Component {
  contentRef = React.createRef();

  getBoundary() {
    if (this.contentRef && this.contentRef.current && this.contentRef.current.getBoundary) {
      return this.contentRef.current.getBoundary();
    }
    return {};
  }

  render() {
    const { id, data, focusedId, onEvent } = this.props;
    const ChosenRenderer = chooseRendererByType(data.$type);

    const nodeContent = (
      <ChosenRenderer id={id} data={data} focusedId={focusedId} onEvent={onEvent} ref={this.contentRef} />
    );
    if (focusedId === id) {
      return <div style={{ outline: '2px solid grey', display: 'inline-block' }}>{nodeContent}</div>;
    }
    return nodeContent;
  }
}

NodeRenderer.propTypes = {
  id: PropTypes.string,
  data: PropTypes.any,
  focusedId: PropTypes.string,
  onEvent: PropTypes.func,
};
