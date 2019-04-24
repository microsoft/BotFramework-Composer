import React from 'react';

import { ObiTypes } from '../../transformers/constants/ObiTypes';
import { RootDialog, EventGroup, IntentGroup, StepGroup, RecognizerGroup } from '../groups';
import {
  DefaultRenderer,
  WelcomeRule,
  IntentRule,
  Recognizer,
  BeginDialog,
  NoMatchRule,
  EventRule,
  IfCondition,
} from '../nodes/index';

import { Boundary } from './Boundary';
import { NodeProps, defaultNodeProps } from './sharedProps';

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
  [ObiTypes.RecognizerGroup]: RecognizerGroup,
  [ObiTypes.EventGroup]: EventGroup,
  [ObiTypes.IntentGroup]: IntentGroup,
  [ObiTypes.StepGroup]: StepGroup,
  [ObiTypes.RuleGroup]: StepGroup,
};
const DEFAULT_RENDERER = DefaultRenderer;

function chooseRendererByType($type) {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

export class NodeRenderer extends React.Component {
  containerRef = React.createRef();
  contentRef = React.createRef();

  getBoundary() {
    if (this.contentRef.current && this.contentRef.current.getBoundary) {
      return this.contentRef.current.getBoundary();
    }

    return new Boundary(this.containerRef.current.scrollWidth || 0, this.containerRef.current.scrollHeight || 0);
  }

  render() {
    const { id, data, expanded, focusedId, onEvent } = this.props;

    let ChosenRenderer;
    if (expanded) {
      ChosenRenderer = RootDialog;
    } else {
      ChosenRenderer = chooseRendererByType(data.$type);
    }

    return (
      <div
        className="node-renderer-container"
        style={{ outline: focusedId === id ? '2px solid grey' : null, display: 'inline-block' }}
        ref={this.containerRef}
      >
        <ChosenRenderer ref={this.contentRef} id={id} data={data} focusedId={focusedId} onEvent={onEvent} />
      </div>
    );
  }
}

NodeRenderer.propTypes = NodeProps;
NodeRenderer.defaultProps = defaultNodeProps;
