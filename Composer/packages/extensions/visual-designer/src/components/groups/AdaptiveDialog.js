import React from 'react';

import transformAdaptiveDialog from '../../transformers/transformAdaptiveDialog';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../NodeRenderer';
import { GraphObjectModel } from '../shared/GraphObjectModel';
import { NodeClickActionTypes } from '../../shared/NodeClickActionTypes';
import { DynamicStyledComponent } from '../shared/DynamicStyledComponent';

const ContainerPaddingX = 50;
const ContainerPaddingY = 50;
const ElementInterval = 30;

export class AdaptiveDialog extends DynamicStyledComponent {
  width = 0;
  height = 0;

  boxes = {
    recognizerNode: new GraphObjectModel(),
    eventGroupNode: new GraphObjectModel(),
    intentGroupNode: new GraphObjectModel(),
  };

  computeProps(props) {
    const { boxes } = this;
    const { recognizer, eventGroup, intentGroup } = transformAdaptiveDialog(props.data);
    const buildProps = node => ({
      id: node.id,
      data: node.json,
      focusedId: props.focusedId,
      onEvent: (...args) => this.props.onEvent(...args),
    });

    if (recognizer) {
      boxes.recognizerNode.props = buildProps(recognizer);
    }
    if (eventGroup) {
      boxes.eventGroupNode.props = buildProps(eventGroup);
    }
    if (intentGroup) {
      boxes.intentGroupNode.props = buildProps(intentGroup);
    }
  }

  updateDOMStyle() {
    const { recognizerNode, eventGroupNode, intentGroupNode } = this.boxes;
    const nodes = [recognizerNode, eventGroupNode, intentGroupNode];

    // Measure node size
    nodes.forEach(x => {
      x.boundary = {
        width: x.ref.current.scrollWidth,
        height: x.ref.current.scrollHeight,
      };
    });

    // Measure container size
    const maxWidth = Math.max(...nodes.map(x => x.boundary.width));
    const totalHeight =
      recognizerNode.boundary.height + eventGroupNode.boundary.height + intentGroupNode.boundary.height;

    this.width = maxWidth + 2 * ContainerPaddingX;
    this.height = totalHeight + 2 * ElementInterval + 2 * ContainerPaddingY;

    // Measure node offset
    recognizerNode.offset = { x: (this.width - recognizerNode.boundary.width) / 2, y: ContainerPaddingY };
    eventGroupNode.offset = {
      x: (this.width - eventGroupNode.boundary.width) / 2,
      y: recognizerNode.offset.y + recognizerNode.boundary.height + ElementInterval,
    };
    intentGroupNode.offset = {
      x: (this.width - intentGroupNode.boundary.width) / 2,
      y: eventGroupNode.offset.y + eventGroupNode.boundary.height + ElementInterval,
    };

    // Apply layout
    nodes.forEach(x => {
      x.ref.current.style.left = x.offset.x + 'px';
      x.ref.current.style.top = x.offset.y + 'px';
    });
  }

  renderContent() {
    const { recognizerNode, eventGroupNode, intentGroupNode } = this.boxes;

    const recognizer = recognizerNode.props && (
      <NodeRenderer key="recognizer" ref={recognizerNode.ref} {...recognizerNode.props} />
    );
    const events = eventGroupNode.props && (
      <NodeRenderer key="eventGroup" ref={eventGroupNode.ref} {...eventGroupNode.props} />
    );
    const intents = intentGroupNode.props && (
      <NodeRenderer key="intentGroup" ref={intentGroupNode.ref} {...intentGroupNode.props} />
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
