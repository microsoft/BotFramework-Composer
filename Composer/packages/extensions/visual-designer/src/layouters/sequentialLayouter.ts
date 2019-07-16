import { Boundary } from '../shared/Boundary';
import { GraphNode } from '../shared/GraphNode';
import { ElementInterval } from '../shared/elementSizes';
import { GraphLayout } from '../shared/GraphLayout';
import { EdgeData } from '../shared/EdgeData';

import { calculateSequenceBoundary } from './calculateNodeBoundary';

const StepInterval = ElementInterval.y;
const ExtraEdgeLength = ElementInterval.y / 2;

export function sequentialLayouter(nodes: GraphNode[], withHeadEdge = true, withTrailingEdge = true): GraphLayout {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return { boundary: new Boundary(), nodes: [], edges: [] };
  }

  const box = calculateSequenceBoundary(nodes.map(x => x.boundary), withHeadEdge, withTrailingEdge);

  nodes.reduce((offsetY, node) => {
    node.offset = { x: box.axisX - node.boundary.axisX, y: offsetY };
    return offsetY + node.boundary.height + StepInterval;
  }, 0);

  const edges: EdgeData[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const { id, boundary, offset } = nodes[i];
    const x = box.axisX;
    const y = boundary.height + offset.y;
    edges.push({
      id: `edge/${id}->next`,
      direction: 'y',
      x,
      y,
      length: StepInterval,
      directed: true,
    });
  }

  if (withHeadEdge) {
    nodes.forEach(node => {
      node.offset.y += ExtraEdgeLength;
    });
    edges.forEach(edge => {
      edge.y += ExtraEdgeLength;
    });
    edges.unshift({
      id: `edge/head/${nodes[0].id}--before`,
      direction: 'y',
      x: box.axisX,
      y: 0,
      length: ExtraEdgeLength,
      directed: true,
    });
  }

  if (withTrailingEdge) {
    edges.push({
      id: `edge/tail/${nodes[nodes.length - 1].id}--after`,
      direction: 'y',
      x: box.axisX,
      y: box.height - ExtraEdgeLength,
      length: ExtraEdgeLength,
    });
  }

  return { boundary: box, nodes, edges };
}
