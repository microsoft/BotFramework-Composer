import React from 'react';

import { ObiTypes } from '../../shared/ObiTypes';
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
  interactive = false;

  getOutline = (id, focusedId, selectedNodes = []) => {
    const found = selectedNodes.find(element => {
      return element === id;
    });

    if (found) {
      return { outline: '3px solid #0078d3', display: 'inline-block' };
    }
    return { outline: focusedId && focusedId === id ? '3px solid grey' : null, display: 'inline-block' };
  };

  render() {
    const { id, data, focusedId, onEvent, onResize, nodeRefs, selectedNodes } = this.props;
    const ChosenRenderer = chooseRendererByType(data.$type);
    return (
      <div
        className="node-renderer-container"
        style={this.getOutline(id, focusedId, selectedNodes)}
        ref={el => {
          if (el && !this.interactive) {
            onResize(new Boundary(el.scrollWidth, el.scrollHeight), 'nodeRenderer');
          }
          if (el && nodeRefs) {
            nodeRefs[id] = el;
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
