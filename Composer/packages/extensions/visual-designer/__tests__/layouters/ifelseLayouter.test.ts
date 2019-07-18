import { ifElseLayouter } from '../../src/layouters/ifelseLayouter';
import { Boundary } from '../../src/shared/Boundary';
import { GraphNode } from '../../src/shared/GraphNode';

describe('ifElseLayouter', () => {
  let ifNode, elseNode, conditionNode, choiceNode;

  beforeEach(() => {
    ifNode = new GraphNode('1', {}, new Boundary(280, 80));
    elseNode = new GraphNode('1', {}, new Boundary(280, 80));
    conditionNode = new GraphNode('1', {}, new Boundary(280, 80));
    choiceNode = new GraphNode('1', {}, new Boundary(280, 80));
  });

  it('should return an empty graphLayout when conditionNode or choiceNode is null', () => {
    expect(ifElseLayouter(null, new GraphNode(), new GraphNode(), new GraphNode()).boundary).toEqual(new Boundary());
    expect(ifElseLayouter(new GraphNode(), null, new GraphNode(), new GraphNode()).boundary).toEqual(new Boundary());
  });

  it('should reuturn a graphLayout whose edges count is 7', () => {
    expect(ifElseLayouter(conditionNode, choiceNode, ifNode, elseNode).edges.length).toEqual(7);
  });
});
