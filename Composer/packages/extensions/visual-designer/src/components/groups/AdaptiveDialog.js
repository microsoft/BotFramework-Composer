import React from 'react';

import transformAdaptiveDialog from '../../transformers/transformAdaptiveDialog';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../NodeRenderer';
import { OffsetContainer } from '../OffsetContainer';
import { GraphNode } from '../shared/GraphNode';
import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';

const ContainerPaddingX = 50;
const ContainerPaddingY = 50;
const ElementInterval = 30;

export class AdaptiveDialog extends React.Component {
  width = 0;
  height = 0;

  elements = {
    recognizerNode: new GraphNode(),
    eventGroupNode: new GraphNode(),
    intentGroupNode: new GraphNode(),
  };

  componentDidMount() {
    this.updateLayoutAfterChildrenMount();
    this.forceUpdate();
  }

  updateElements() {
    const { elements } = this;
    const { recognizer, eventGroup, intentGroup } = transformAdaptiveDialog(this.props.data);

    if (recognizer) {
      elements.recognizerNode.props = this.buildProps(recognizer);
    }
    if (eventGroup) {
      elements.eventGroupNode.props = this.buildProps(eventGroup);
    }
    if (intentGroup) {
      elements.intentGroupNode.props = this.buildProps(intentGroup);
    }
  }

  getBoundary() {
    return {
      width: this.width,
      height: this.height,
      in: { x: 0, y: this.width / 2 },
      out: { x: this.height, y: this.width / 2 },
    };
  }

  updateLayoutAfterChildrenMount() {
    const { recognizerNode, eventGroupNode, intentGroupNode } = this.elements;
    [recognizerNode, eventGroupNode, intentGroupNode].forEach(x => (x.boundary = x.ref.current.getBoundary()));

    const maxWidth = Math.max(...[recognizerNode, eventGroupNode, intentGroupNode].map(x => x.boundary.width));

    const totalHeight =
      recognizerNode.boundary.height + eventGroupNode.boundary.height + intentGroupNode.boundary.height;

    this.width = maxWidth + 2 * ContainerPaddingX;
    this.height = totalHeight + 2 * ElementInterval + 2 * ContainerPaddingY;

    recognizerNode.offset = { x: (this.width - recognizerNode.boundary.width) / 2, y: ContainerPaddingY };
    eventGroupNode.offset = {
      x: (this.width - eventGroupNode.boundary.width) / 2,
      y: recognizerNode.offset.y + recognizerNode.boundary.height + ElementInterval,
    };
    intentGroupNode.offset = {
      x: (this.width - intentGroupNode.boundary.width) / 2,
      y: eventGroupNode.offset.y + eventGroupNode.boundary.height + ElementInterval,
    };
  }

  buildProps(node) {
    return {
      id: node.id,
      data: node.json,
      focusedId: this.props.focusedId,
      onEvent: (...args) => this.props.onEvent(...args),
    };
  }

  render() {
    this.updateElements();

    const { recognizerNode, eventGroupNode, intentGroupNode } = this.elements;

    const recognizer = recognizerNode.props && (
      <OffsetContainer offset={recognizerNode.offset}>
        <NodeRenderer key="recognizer" ref={recognizerNode.ref} {...recognizerNode.props} />
      </OffsetContainer>
    );
    const events = eventGroupNode.props && (
      <OffsetContainer offset={eventGroupNode.offset}>
        <NodeRenderer key="eventGroup" ref={eventGroupNode.ref} {...eventGroupNode.props} />
      </OffsetContainer>
    );
    const intents = intentGroupNode.props && (
      <OffsetContainer offset={intentGroupNode.offset}>
        <NodeRenderer key="intentGroup" ref={intentGroupNode.ref} {...intentGroupNode.props} />
      </OffsetContainer>
    );

    return (
      <div
        style={{ width: this.width, height: this.height, position: 'relative' }}
        onClick={e => {
          e.stopPropagation();
          this.props.onEvent(NodeClickActionTypes.Focus, '');
        }}
      >
        {recognizer}
        {events}
        {intents}
      </div>
    );
  }
}

AdaptiveDialog.propTypes = NodeProps;
AdaptiveDialog.defaultProps = defaultNodeProps;
