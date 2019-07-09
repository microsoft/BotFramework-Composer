import React from 'react';

import { DefaultRenderer } from '../components/nodes';
import { FlowTypes } from '../logicflow/models/LogicFlowNodes';

export const renderObiData = (id: string, type: FlowTypes, data: any) => {
  return <DefaultRenderer id={id} data={data} onEvent={(e, id) => console.log('Event fired: ', e, id)} />;
};
