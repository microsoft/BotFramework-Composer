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
  ActivityRenderer,
  Foreach,
} from '../nodes/index';

// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from './sharedProps';
import './NodeRenderer.css';

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
  [ObiTypes.Foreach]: Foreach,
  [ObiTypes.ForeachPage]: Foreach,
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
    const { id, data, focusedId, onEvent, onResize, getLgTemplates } = this.props;
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
          getLgTemplates={getLgTemplates}
        />
      </div>
    );
  }
}
