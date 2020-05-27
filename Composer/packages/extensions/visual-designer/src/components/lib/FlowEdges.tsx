// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';

import { Edge } from '../../adaptive-visual-sdk/models/EdgeData';

import { renderEdge } from './EdgeUtil';

export interface FlowEdgesProps {
  edges: Edge[];
}

export const FlowEdges: FC<FlowEdgesProps> = ({ edges }) => {
  if (!Array.isArray(edges)) return null;
  return <>{edges.map((edge) => renderEdge(edge))}</>;
};
