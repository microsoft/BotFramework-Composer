import { Boundary } from '../../src/models/Boundary';
import { GraphNode } from '../../src/models/GraphNode';
import { foreachLayouter } from '../../src/layouters/foreachLayouter';

describe('foreachLayouter', () => {
  let foreachNode, stepsNode, loopBeginNode, loopEndNode;

  beforeEach(() => {
    loopBeginNode = new GraphNode('11', {}, new Boundary(280, 80));
    loopEndNode = new GraphNode('12', {}, new Boundary(280, 80));
    foreachNode = new GraphNode('0', {}, new Boundary(280, 80));
    stepsNode = new GraphNode('1', {}, new Boundary(280, 80));
  });

  it('should return an empty graphLayout when foreachNode or stepsNode is null', () => {
    expect(foreachLayouter(null, new GraphNode(), loopBeginNode, loopEndNode).boundary).toEqual(new Boundary());
    expect(foreachLayouter(new GraphNode(), null, loopBeginNode, loopEndNode).boundary).toEqual(new Boundary());
  });

  it('should reuturn a graphLayout whose edges count is 6', () => {
    expect(foreachLayouter(foreachNode, stepsNode, loopBeginNode, loopEndNode).edges.length).toEqual(6);
  });
});
