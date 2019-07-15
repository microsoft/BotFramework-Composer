import { Boundary } from '../../src/shared/Boundary';
import { GraphNode } from '../../src/shared/GraphNode';
import { foreachLayouter } from '../../src/layouters/foreachLayouter';

describe('foreachLayouter', () => {
  let boundary = new Boundary();
  let foreachNode, stepsNode, loopBeginNode, loopEndNode;

  beforeEach(() => {
    loopBeginNode = new GraphNode('11', {}, new Boundary(280, 80));
    loopEndNode = new GraphNode('12', {}, new Boundary(280, 80));
    foreachNode = new GraphNode('0', {}, new Boundary(280, 80));
    stepsNode = new GraphNode('1', {}, new Boundary(280, 80));
  });

  it('should return an empty graphLayout when foreachNode or stepsNode is null', () => {
    expect(foreachLayouter(null, new GraphNode(), loopBeginNode, loopEndNode)).toEqual({ boundary });
    expect(foreachLayouter(new GraphNode(), null, loopBeginNode, loopEndNode)).toEqual({ boundary });
  });

  it('should reuturn a graphLayout whose edges count is 6', () => {
    expect(foreachLayouter(foreachNode, stepsNode, loopBeginNode, loopEndNode).edges!.length).toEqual(6);
  });
});
