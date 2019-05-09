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
  SwitchCondition,
} from '../nodes/index';
import { NodeEventTypes } from '../../shared/NodeEventTypes';

import { Boundary } from './Boundary';
import { NodeProps, defaultNodeProps } from './sharedProps';
import './NodeRenderer.css';

const rendererByObiType = {
  [ObiTypes.IntentRule]: IntentRule,
  [ObiTypes.UnknownIntentRule]: UnknownIntentRule,
  [ObiTypes.RegexRecognizer]: Recognizer,
  [ObiTypes.LuisRecognizer]: Recognizer,
  [ObiTypes.BeginDialog]: BeginDialog,
  [ObiTypes.EventRule]: EventRule,
  [ObiTypes.IfCondition]: IfCondition,
  [ObiTypes.SwitchCondition]: SwitchCondition,
};
const DEFAULT_RENDERER = DefaultRenderer;

function chooseRendererByType($type) {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

export class NodeRenderer extends React.Component {
  containerRef = React.createRef();
  interactive = false;

  renderToolbar() {
    const { id, onEvent } = this.props;
    return (
      <div className="node-renderer-toolbar" style={{ position: 'absolute', height: '20px', right: 0, top: -20 }}>
        <button
          onClick={e => {
            e.stopPropagation();
            onEvent(NodeEventTypes.Delete, { id });
          }}
        >
          X
        </button>
      </div>
    );
  }

  render() {
    const { id, data, focusedId, onEvent, onResize } = this.props;
    const ChosenRenderer = chooseRendererByType(data.$type);
    return (
      <div
        className="node-renderer-container"
        style={{
          outline: focusedId && focusedId === id ? '2px solid grey' : null,
          display: 'inline-block',
          position: 'relative',
        }}
        ref={el => {
          if (el && !this.interactive) {
            onResize(new Boundary(el.scrollWidth, el.scrollHeight), 'nodeRenderer');
          }
        }}
      >
        {this.renderToolbar()}
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
