import React from 'react';

import { NodeRenderer } from '../components/shared/NodeRenderer';

export const renderObiData = (id, data): JSX.Element => {
  return <NodeRenderer id={id} data={data} />;
};
