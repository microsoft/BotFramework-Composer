import React from 'react';

import { NodeProps, defaultNodeProps } from './sharedProps';

export class EventGroup extends React.Component {
  render() {
    const { data } = this.props;
    return (
      <div
        style={{
          width: 170,
          height: 30,
          background: '#BAD80A',
          boxShadow: '0px 1.2px 3.6px rgba(0, 0, 0, 0.108), 0px 6.4px 14.4px rgba(0, 0, 0, 0.132)',
          borderRadius: '4px',
          cursor: 'pointer',
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
    );
  }
}

EventGroup.propTypes = NodeProps;
EventGroup.defaultProps = defaultNodeProps;
