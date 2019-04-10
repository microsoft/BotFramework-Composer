import React from 'react';

import { NodeProps, defaultNodeProps } from './sharedProps';

export class EventGroup extends React.Component {
  render() {
    return <div style={{ width: 200, height: 80 }}>This is a event group</div>;
  }
}

EventGroup.propTypes = NodeProps;
EventGroup.defaultProps = defaultNodeProps;
