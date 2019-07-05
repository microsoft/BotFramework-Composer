import React, { FunctionComponent } from 'react';

import { FlowGroup } from './LogicFlowNodes';

export interface LogicFlowProps {
  flow: FlowGroup;
  onEvent: (id: string, event: any) => any;
}

export const LogicFlow: FunctionComponent<LogicFlowProps> = ({ flow }) => {
  console.log('flow', flow);
  return <div>{JSON.stringify(flow)}</div>;
};
