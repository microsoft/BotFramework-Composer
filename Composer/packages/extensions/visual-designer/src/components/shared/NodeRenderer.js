import React from 'react';

import { ObiTypes } from '../../shared/ObiTypes';
import {
  DefaultRenderer,
  IntentRule,
  Recognizer,
  BeginDialog,
  UnknownIntentRule,
  EventRule,
  IfCondition,
} from '../nodes/index';

import { Boundary } from './Boundary';
import { NodeProps, defaultNodeProps } from './sharedProps';

const rendererByObiType = {
  [ObiTypes.IntentRule]: IntentRule,
  [ObiTypes.UnknownIntentRule]: UnknownIntentRule,
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
  interactive = false;

  render() {
    const { id, data, focusedId, onEvent, onResize } = this.props;
    const ChosenRenderer = chooseRendererByType(data.$type);
    return (
      <div
        className="node-renderer-container"
        style={{ outline: focusedId && focusedId === id ? '2px solid grey' : null, display: 'inline-block' }}
        ref={el => {
          if (el && !this.interactive) {
            onResize(new Boundary(el.scrollWidth, el.scrollHeight), 'nodeRenderer');
          }
        }}
      >
        <ChosenRenderer
          id={id}
          data={data}
          focusedId={focusedId}
          onEvent={onEvent}
          onResize={size => {
            this.interactive = true;
            onResize(size, 'node');
          }}
        />
      </div>
    );
  }
}

NodeRenderer.propTypes = NodeProps;
NodeRenderer.defaultProps = defaultNodeProps;
