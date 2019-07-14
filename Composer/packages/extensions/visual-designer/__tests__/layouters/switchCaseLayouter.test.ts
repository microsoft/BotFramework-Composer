import { Boundary } from '../../src/shared/Boundary';
import { GraphNode } from '../../src/shared/GraphNode';
import { switchCaseLayouter } from '../../src/layouters/switchCaseLayouter';

describe('switchCaseLayouter', () => {
  let boundary = new Boundary();
  let branchNodes, conditionNode, choiceNode;

  beforeEach(() => {
    branchNodes = [
      new GraphNode('11', {}, new Boundary(280, 80)),
      new GraphNode('12', {}, new Boundary(280, 80)),
      new GraphNode('13', {}, new Boundary(280, 80)),
    ];
    conditionNode = new GraphNode('0', {}, new Boundary(280, 80));
    choiceNode = new GraphNode('1', {}, new Boundary(280, 80));
  });

  it('should return an empty graphLayout when conditionNode is null', () => {
    expect(switchCaseLayouter(null, new GraphNode(), branchNodes)).toEqual({ boundary });
  });

  it('should reuturn a graphLayout whose edges count is 9 when branchNodes.length = 3', () => {
    expect(switchCaseLayouter(conditionNode, choiceNode, branchNodes).edges!.length).toEqual(9);
  });
});
