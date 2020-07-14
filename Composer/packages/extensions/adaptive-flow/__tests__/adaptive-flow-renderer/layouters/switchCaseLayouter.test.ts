// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Boundary } from '../../../src/adaptive-flow-renderer/models/Boundary';
import { GraphNode } from '../../../src/adaptive-flow-renderer/models/GraphNode';
import { switchCaseLayouter } from '../../../src/adaptive-flow-renderer/layouters/switchCaseLayouter';

describe('switchCaseLayouter', () => {
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
    expect(switchCaseLayouter(null, new GraphNode(), branchNodes).boundary).toEqual(new Boundary());
  });

  it('should reuturn a graphLayout whose edges count is 9 when branchNodes.length = 3', () => {
    expect(switchCaseLayouter(conditionNode, choiceNode, branchNodes).edges.length).toEqual(9);
  });
});
