import React from 'react';

import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { NodeRenderer } from '../NodeRenderer';

const EventGroupTitleHeight = 30;
const EventElemetHeight = 50;
const EventElemetWidth = 170;
const EventMarginX = 5;
const EventMarginY = 10;
const EventBlockHeight = EventElemetHeight + 2 * EventMarginY;
const EventBlockWidth = EventElemetWidth + 2 * EventMarginX;
const themeColor = '#BAD80A';

export class EventGroup extends React.Component {
  width = 0;
  height = 0;

  getBoundary() {
    return {
      width: this.width,
      height: this.height,
      in: { x: 0, y: this.width / 2 },
      out: { x: this.height, y: this.width / 2 },
    };
  }

  renderEvent(eventNode) {
    const data = eventNode.json;
    const propagateEvent = (...args) => this.props.onEvent(...args);
    return (
      <NodeRenderer
        id={eventNode.id}
        key={eventNode.id}
        data={data}
        focusedId={this.props.focusedId}
        onEvent={propagateEvent}
      />
    );
  }

  render() {
    const { data } = this.props;
    this.width = EventBlockWidth;
    this.height = data.children.length * EventBlockHeight + EventGroupTitleHeight;

    return (
      <div
        style={{
          width: this.width,
          height: this.height,
          border: `1px solid ${themeColor}`,
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
