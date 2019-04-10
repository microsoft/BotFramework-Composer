import React from 'react';

import { NodeProps, defaultNodeProps } from './sharedProps';

export class IntentGroup extends React.Component {
  render() {
    return <div style={{ width: 200, height: 400 }}>This is a node group</div>;
  }
}

IntentGroup.propTypes = NodeProps;
IntentGroup.defaultProps = defaultNodeProps;
