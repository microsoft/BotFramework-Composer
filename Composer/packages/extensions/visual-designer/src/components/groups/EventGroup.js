import React from 'react';

import { PAYLOAD_KEY } from '../../utils/constant';
import { NodeProps, defaultNodeProps } from '../nodes/sharedProps';
import { NodeRenderer } from '../../utils/NodeRenderer';

const EventGroupTitleHeight = 30;
const EventElemetHeight = 50;
const EventElemetWidth = 170;
const EventMarginX = 5;
const EventMarginY = 10;
const EventBlockHeight = EventElemetHeight + 2 * EventMarginY;
const EventBlockWidth = EventElemetWidth + 2 * EventMarginX;
const themeColor = '#BAD80A';

export class EventGroup extends React.Component {
  renderEvent(eventNode) {
    const data = eventNode[PAYLOAD_KEY];
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
    return (
      <div
        style={{
          width: EventBlockWidth,
          height: data.children.length * EventBlockHeight + EventGroupTitleHeight,
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
