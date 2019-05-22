import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../shared/NodeRenderer';
import { Boundary } from '../shared/Boundary';
import { ElementWidth, ElementHeight } from '../shared/NodeMeta';

const EventGroupTitleHeight = 30;
const EventElemetHeight = ElementHeight;
const EventElemetWidth = ElementWidth;
const EventMarginX = 5;
const EventMarginY = 10;
const EventBlockHeight = EventElemetHeight + 2 * EventMarginY;
const EventBlockWidth = EventElemetWidth + 2 * EventMarginX;
const themeColor = '#BAD80A';

export class EventGroup extends React.Component {
  containerElement;

  propagateBoundary() {
    if (!this.containerElement) return;

    const { scrollWidth, scrollHeight } = this.containerElement;
    this.props.onResize(new Boundary(scrollWidth, scrollHeight));
  }

  renderEvent(eventNode) {
    const data = eventNode.json;
    const { focusedId, onEvent } = this.props;
    return (
      <NodeRenderer
        id={eventNode.id}
        key={eventNode.id}
        data={data}
        focusedId={focusedId}
        onEvent={onEvent}
        onResize={() => {
          this.propagateBoundary();
        }}
      />
    );
  }

  render() {
    const { data } = this.props;
    const width = EventBlockWidth;
    const height = data.children.length * EventBlockHeight + EventGroupTitleHeight;

    return (
      <div
        style={{
          width,
          height,
          border: `1px solid ${themeColor}`,
        }}
        ref={el => {
          this.containerElement = el;
          this.propagateBoundary();
        }}
      >
        <div
          style={{
            width: EventBlockWidth,
            height: EventGroupTitleHeight,
            background: themeColor,
          }}
        >
          <span
            style={{
              marginLeft: 10,
              fontFamily: 'Segoe UI',
              fontSize: '14px',
              lineHeight: '19px',
              color: '#FFFFFF',
            }}
          >
            Events ({data.children.length})
          </span>
        </div>
        {data.children.map(x => (
          <div
            key={x.id + 'block'}
            style={{
              margin: `${EventMarginY}px ${EventMarginX}px`,
              height: EventElemetHeight,
              boxSizing: 'border-box',
            }}
          >
            {this.renderEvent(x)}
          </div>
        ))}
      </div>
    );
  }
}

EventGroup.propTypes = NodeProps;
EventGroup.defaultProps = defaultNodeProps;
