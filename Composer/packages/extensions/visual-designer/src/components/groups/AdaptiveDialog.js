import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { RootDialogStrategy } from '../../transformers/strategies/RootDialogStrategy';
import { NodeRenderer } from '../NodeRenderer';
import { OffsetContainer } from '../OffsetContainer';

const ContainerPaddingX = 50;
const ContainerPaddingY = 50;
const ElementInterval = 30;

export class AdaptiveDialog extends React.Component {
  width = 0;
  height = 0;

  nodes = {};

  componentDidMount() {
    this.updateLayoutAfterChildrenMount();
    this.forceUpdate();
  }

  updateNodes(recognizer, eventGroup, intentGroup) {
    const nodes = this.nodes;
    if (recognizer) nodes.recognizerNode = { ...nodes.recognizerNode, ref: React.createRef() };
    if (eventGroup) nodes.eventGroupNode = { ...nodes.eventGroupNode, ref: React.createRef() };
    if (intentGroup) nodes.intentGroupNode = { ...nodes.intentGroupNode, ref: React.createRef() };
    return nodes;
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
    const { recognizerNode, eventGroupNode, intentGroupNode } = this.nodes;
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
    const { data } = this.props;
    const { eventGroup, intentGroup, recognizers } = RootDialogStrategy.selectNodes(data);

    this.nodes = this.updateNodes(recognizers[0], eventGroup, intentGroup);
    const { recognizerNode, eventGroupNode, intentGroupNode } = this.nodes;

    const recognizer = recognizerNode && (
      <OffsetContainer offset={recognizerNode.offset}>
        <NodeRenderer key="recognizer" ref={recognizerNode.ref} {...this.buildProps(recognizers[0])} />
      </OffsetContainer>
    );
    const events = eventGroupNode && (
      <OffsetContainer offset={eventGroupNode.offset}>
        <NodeRenderer key="eventGroup" ref={eventGroupNode.ref} {...this.buildProps(eventGroup)} />
      </OffsetContainer>
    );
    const intents = intentGroupNode && (
      <OffsetContainer offset={intentGroupNode.offset}>
        <NodeRenderer key="intentGroup" ref={intentGroupNode.ref} {...this.buildProps(intentGroup)} />
      </OffsetContainer>
    );

    return (
      <div style={{ width: this.width, height: this.height, position: 'relative' }}>
        {recognizer}
        {events}
        {intents}
      </div>
    );
  }
}

AdaptiveDialog.propTypes = NodeProps;
AdaptiveDialog.defaultProps = defaultNodeProps;
