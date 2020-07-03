// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';

import { Edge } from '../models/EdgeData';
import { renderEdge } from '../utils/visual/EdgeUtil';

export interface EdgesProps {
  edges: Edge[];
}

export const FlowEdges: FC<EdgesProps> = ({ edges }) => {
  if (!Array.isArray(edges)) return null;
  return <>{edges.map((edge) => renderEdge(edge))}</>;
};
