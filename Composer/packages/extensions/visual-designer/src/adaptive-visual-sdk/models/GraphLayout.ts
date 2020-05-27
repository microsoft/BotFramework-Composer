// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Boundary } from './Boundary';
import { GraphNode } from './GraphNode';
import { Edge } from './EdgeData';

export class GraphLayout {
  boundary: Boundary = new Boundary();
  nodes: GraphNode[] = [];
  nodeMap: { [id: string]: GraphNode } = {};
  edges: Edge[] = [];
}
