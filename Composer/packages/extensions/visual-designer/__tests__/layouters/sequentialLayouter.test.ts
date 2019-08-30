import { sequentialLayouter } from '../../src/layouters/sequentialLayouter';
import { Boundary } from '../../src/models/Boundary';
import { GraphNode } from '../../src/models/GraphNode';
import { calculateSequenceBoundary } from '../../src/layouters/calculateNodeBoundary';

describe('sequentialLayouter', () => {
  let nodes;

  beforeEach(() => {
    nodes = [
      new GraphNode('1', {}, new Boundary(280, 80)),
      new GraphNode('2', {}, new Boundary(280, 80)),
      new GraphNode('3', {}, new Boundary(280, 80)),
    ];
  });

  it('should return an empty graphLayout when nodes is not an array or is an empty array', () => {
    expect(sequentialLayouter([]).boundary).toEqual(new Boundary());
  });
  it('should reuturn a graphLayout whose boundary be calcalated by calculateSequenceBoundary function', () => {
    expect(sequentialLayouter(nodes).boundary).toEqual(calculateSequenceBoundary(nodes.map(x => x.boundary)));
  });
  it('should reuturn a graphLayout whose edges count is 4 when nodes.length is 3', () => {
    expect(sequentialLayouter(nodes).edges.length).toEqual(4);
  });
  it('should reuturn a graphLayout whose nodes count is 3 when nodes.length is 3', () => {
    expect(sequentialLayouter(nodes).nodes.length).toEqual(3);
  });
});
