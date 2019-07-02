import React from 'react';
import classnames from 'classnames';

import { ObiTypes } from '../../shared/ObiTypes';
import {
  DefaultRenderer,
  IntentRule,
  Recognizer,
  BeginDialog,
  ReplaceDialog,
  UnknownIntentRule,
  EventRule,
  IfCondition,
  SwitchCondition,
} from '../nodes/index';

// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from './sharedProps';
import './NodeRenderer.css';

const rendererByObiType = {
  [ObiTypes.IntentRule]: IntentRule,
  [ObiTypes.UnknownIntentRule]: UnknownIntentRule,
  [ObiTypes.RegexRecognizer]: Recognizer,
  [ObiTypes.LuisRecognizer]: Recognizer,
  [ObiTypes.BeginDialog]: BeginDialog,
  [ObiTypes.ReplaceDialog]: ReplaceDialog,
  [ObiTypes.EventRule]: EventRule,
  [ObiTypes.IfCondition]: IfCondition,
  [ObiTypes.SwitchCondition]: SwitchCondition,
  [ObiTypes.ConditionNode]: DefaultRenderer,
};
const DEFAULT_RENDERER = DefaultRenderer;

function chooseRendererByType($type) {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

export class NodeRenderer extends React.Component<NodeProps, {}> {
  static defaultProps = defaultNodeProps;
  containerRef = React.createRef();

  render() {
    const { id, data, focusedId, onEvent, onResize } = this.props;
    const ChosenRenderer = chooseRendererByType(data.$type);
    return (
      <div className={classnames('node-renderer-container', { 'node-renderer-container--focused': focusedId === id })}>
        <ChosenRenderer
          id={id}
          data={data}
          focusedId={focusedId}
          onEvent={onEvent}
          onResize={size => {
            onResize(size, 'node');
          }}
        />
      </div>
    );
  }
}
