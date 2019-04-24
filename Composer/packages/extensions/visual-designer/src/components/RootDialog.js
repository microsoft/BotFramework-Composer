import React from 'react';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeClickActionTypes } from '../shared/NodeClickActionTypes';

import { NodeProps, defaultNodeProps } from './shared/sharedProps';
import { GraphObjectModel } from './shared/GraphObjectModel';
import { DynamicLayoutComponent } from './shared/DynamicLayoutComponent';
import { OffsetContainer } from './shared/OffsetContainer';
import { RecognizerGroup, StepGroup } from './groups';
import { Boundary } from './shared/Boundary';

const ElementIntervalX = 30;

export class RootDialog extends DynamicLayoutComponent {
  width = 0;
  height = 0;

  elements = {
    recognizerGroup: null,
    stepGroup: null,
    ruleGroup: null,
  };

  computeProps(props) {
    const { recognizerGroup, ruleGroup, stepGroup } = transformRootDialog(props.data);

    const createGraphNode = input => {
      if (!input) return null;
      const result = new GraphObjectModel();
      result.props = {
        id: input.id,
        data: input.json,
        focusedId: props.focusedId,
        onEvent: (...args) => this.props.onEvent(...args),
      };
      return result;
    };

    this.elements = {
      recognizerGroup: createGraphNode(recognizerGroup),
      stepGroup: createGraphNode(stepGroup),
      ruleGroup: createGraphNode(ruleGroup),
    };
  }

  measureLayout() {
    const nodes = Object.values(this.elements).filter(x => !!x);
    // Measure node size
    nodes.forEach(x => {
      x.boundary = new Boundary(x.ref.current.scrollWidth, x.ref.current.scrollHeight);
    });

    // Measure container size
    this.width =
      nodes.map(x => x.boundary.width).reduce((sum, val) => sum + val, 0) +
      ElementIntervalX * Math.max(nodes.length - 1, 0);
    this.height = Math.max(0, ...nodes.map(x => x.boundary.height));

    nodes.reduce((offsetX, node) => {
      node.offset = { x: offsetX, y: 0 };
      return offsetX + node.boundary.width + ElementIntervalX;
    }, 0);
  }

  renderElement(element, key) {
    if (!element) return null;
    let content = null;
    switch (key) {
      case 'recognizerGroup':
        content = <RecognizerGroup key={key} {...element.props} />;
        break;
      case 'stepGroup':
      case 'ruleGroup':
        content = <StepGroup key={key} {...element.props} />;
        break;
    }
    if (content) {
      return (
        <OffsetContainer key={`${key}.offset`} offset={element.offset}>
          <div ref={element.ref}>{content}</div>
        </OffsetContainer>
      );
    }
    return null;
  }

  renderContent() {
    return (
      <div
        style={{ width: this.width, height: this.height, margin: 20, position: 'relative' }}
        onClick={e => {
          e.stopPropagation();
          this.props.onEvent(NodeClickActionTypes.Focus, '');
        }}
      >
        {Object.keys(this.elements).map(key => this.renderElement(this.elements[key], key))}
      </div>
    );
  }
}

RootDialog.propTypes = NodeProps;
RootDialog.defaultProps = defaultNodeProps;
