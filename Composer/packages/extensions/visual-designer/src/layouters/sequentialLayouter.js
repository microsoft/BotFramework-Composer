import { Boundary } from '../components/shared/Boundary';

export function sequentialLayouter(nodes, ElementInterval = 20, withHeadEdge = true, withTrailingEdge = true) {
  const box = new Boundary();

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return { boundary: box, nodes: [], edges: [] };
  }

  box.axisX = Math.max(0, ...nodes.map(x => x.boundary.axisX));
  box.width = box.axisX + Math.max(0, ...nodes.map(x => x.boundary.width - x.boundary.axisX));
  box.height =
    nodes.map(x => x.boundary.height).reduce((sum, val) => sum + val, 0) +
    ElementInterval * Math.max(nodes.length - 1, 0);

  nodes.reduce((offsetY, node) => {
    node.offset = { x: box.axisX - node.boundary.axisX, y: offsetY };
    return offsetY + node.boundary.height + ElementInterval;
  }, 0);

  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const { id, boundary, offset } = nodes[i];
    const x = box.axisX;
    const y = boundary.height + offset.y;
    edges.push({
      id: `edge/${id}->next`,
      direction: 'y',
      x,
      y,
      length: ElementInterval,
    });
  }

  const ExtraEdgeLength = ElementInterval / 2;
  if (withHeadEdge) {
    box.height += ExtraEdgeLength;
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
    });
  }

  if (withTrailingEdge) {
    box.height += ExtraEdgeLength;
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
