import { Boundary } from '../components/shared/Boundary';

export function sequentialLayouter(nodes, ElementInterval = 20) {
  const box = new Boundary();
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

  return { boundary: box, nodes, edges };
}
