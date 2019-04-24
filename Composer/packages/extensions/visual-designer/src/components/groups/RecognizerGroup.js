import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { GraphObjectModel } from '../shared/GraphObjectModel';
import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';
import { DynamicLayoutComponent } from '../shared/DynamicLayoutComponent';
import { OffsetContainer } from '../shared/OffsetContainer';
import { Boundary } from '../shared/Boundary';

import { EventGroup } from './EventGroup';
import { IntentGroup } from './IntentGroup';

const ElementIntervalVertical = 30;

export class RecognizerGroup extends DynamicLayoutComponent {
  width = 0;
  height = 0;

  elements = [];

  computeProps(props) {
    const { recognizer, eventGroup, intentGroup } = props.data;

    const createGraphNode = input => {
      if (!input) return null;
      const result = new GraphObjectModel();
      result.props = {
        id: input.id,
        data: input.json,
        onEvent: (...args) => this.props.onEvent(...args),
      };
      return result;
    };

    this.elements = {
      recognizer: createGraphNode(recognizer),
      eventGroup: createGraphNode(eventGroup),
      intentGroup: createGraphNode(intentGroup),
    };
  }

  measureLayout() {
    const nodes = Object.values(this.elements).filter(x => !!x);
    // Measure node size
    nodes.forEach(x => {
      if (x.ref.current.getBoundary) {
        x.boundary = x.ref.current.getBoundary();
      } else {
        x.boundary = new Boundary(x.ref.current.scrollWidth, x.ref.current.scrollHeight);
      }
    });

    // Measure container size
    this.width = Math.max(0, ...nodes.map(x => x.boundary.width));
    this.height =
      nodes.map(x => x.boundary.height).reduce((sum, val) => sum + val, 0) +
      ElementIntervalVertical * Math.max(nodes.length - 1, 0);

    nodes.reduce((offsetY, node) => {
      node.offset = { x: (this.width - node.boundary.width) / 2, y: offsetY };
      return offsetY + node.boundary.height + ElementIntervalVertical;
    }, 0);
  }

  renderElement(element, key) {
    if (!element) return null;
    let content = null;
    switch (key) {
      case 'recognizer':
        content = <NodeRenderer key={key} focusedId={this.props.focusedId} ref={element.ref} {...element.props} />;
        break;
      case 'eventGroup':
        content = (
          <div ref={element.ref}>
            <EventGroup key={key} focusedId={this.props.focusedId} {...element.props} />
          </div>
        );
        break;
      case 'intentGroup':
        content = (
          <div ref={element.ref}>
            <IntentGroup key={key} focusedId={this.props.focusedId} {...element.props} />
          </div>
        );
        break;
    }
    if (!content) return null;
    return (
      <OffsetContainer key={`${key}.offset`} offset={element.offset}>
        {content}
      </OffsetContainer>
    );
  }

  renderContent() {
    return (
      <div
        style={{ width: this.width, height: this.height, position: 'relative' }}
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

RecognizerGroup.propTypes = NodeProps;
RecognizerGroup.defaultProps = defaultNodeProps;
