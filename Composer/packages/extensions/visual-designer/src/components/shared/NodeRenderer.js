import React from 'react';

import { ObiTypes } from '../../transformers/constants/ObiTypes';
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
};
const DEFAULT_RENDERER = DefaultRenderer;

function chooseRendererByType($type) {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

export class NodeRenderer extends React.Component {
  containerRef = React.createRef();

  getBoundary() {
    return new Boundary(50, 50);
  }

  render() {
    const { id, data, focusedId, onEvent, onResize } = this.props;
    const ChosenRenderer = chooseRendererByType(data.$type);
    return (
      <div
        className="node-renderer-container"
        style={{ outline: focusedId && focusedId === id ? '2px solid grey' : null, display: 'inline-block' }}
        ref={el => {
          if (el) {
            onResize(new Boundary(el.scrollWidth, el.scrollHeight));
          }
        }}
      >
        <ChosenRenderer id={id} data={data} focusedId={focusedId} onEvent={onEvent} onResize={onResize} />
      </div>
    );
  }
}

NodeRenderer.propTypes = NodeProps;
NodeRenderer.defaultProps = defaultNodeProps;
