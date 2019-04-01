import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { obiTransformer } from '../transformers/ObiTransformer';
import { PAYLOAD_KEY, NodeClickActionTypes } from '../utils/constant';
import { ObiTypes } from '../transformers/constants/ObiTypes';

import { DefaultRenderer, WelcomeRule, IntentRule, Recognizer, CallDialog, FallbackRule } from './nodes';
import { ComponentGraph } from './ComponentGraph';

const rendererByObiType = {
  [ObiTypes.rules.WelcomeRule]: WelcomeRule,
  [ObiTypes.rules.IntentRule]: IntentRule,
  [ObiTypes.rules.FallbackRule]: FallbackRule,
  [ObiTypes.recognizers.RegexRecognizer]: Recognizer,
  [ObiTypes.recognizers.LuisRecognizer]: Recognizer,
  [ObiTypes.steps.CallDialog]: CallDialog,
  default: DefaultRenderer,
};

export class ObiEditor extends Component {
  state = {
    directedGraphItems: [],
    prevObiJson: undefined,
  };

  dispatchEvent(eventName, eventData) {
    const { onSelect, onExpand, onOpen } = this.props;

    let handler;
    switch (eventName) {
      case NodeClickActionTypes.Focus:
        handler = onSelect;
        break;
      case NodeClickActionTypes.Expand:
        handler = onExpand;
        break;
      case NodeClickActionTypes.OpenLink:
        handler = onOpen;
        break;
      default:
        handler = onSelect;
        break;
    }
    return handler(eventData);
  }

  chooseRendererByType($type) {
    const renderer = rendererByObiType[$type] || rendererByObiType.default;
    return renderer;
  }

  createInstance(item) {
    const { id, data } = item;
    const ChosenRenderer = this.chooseRendererByType(data.$type);
    const onTriggerEvent = (eventName, eventData) => this.dispatchEvent(eventName, eventData);

    return <ChosenRenderer id={id} data={data} onTriggerEvent={onTriggerEvent} />;
  }

  buildItemsFromObiJson(data) {
    const selfRenderedItems = obiTransformer
      .toDirectedGraphSchema(data)
      .map(x => ({
        id: x.id,
        neighborIds: x.neighborIds,
        data: x[PAYLOAD_KEY],
      }))
      .map(x => {
        const instance = this.createInstance(x);
        x.instance = instance;
        return x;
      });
    return selfRenderedItems;
  }

  render() {
    const items = this.buildItemsFromObiJson(this.props.data);

    return (
      <div
        className="obi-editor-container"
        data-testid="obi-editor-container"
        style={{ width: '100%', height: '100%' }}
      >
        <ComponentGraph items={items} onNodeClick={payload => this.bubbleNodeClickEvent(payload)} />
      </div>
    );
  }
}

ObiEditor.defaultProps = {
  data: {},
  onSelect: () => {},
  onExpand: () => {},
  onOpen: () => {},
};

ObiEditor.propTypes = {
  // Obi raw json
  data: PropTypes.object,
  onSelect: PropTypes.func,
  onExpand: PropTypes.func,
  onOpen: PropTypes.func,
};
