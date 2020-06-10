// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { baseInputLayouter } from '../../../src/adaptive-flow-renderer/layouters/baseInputLayouter';
import { Boundary } from '../../../src/adaptive-flow-renderer/models/Boundary';
import { GraphNode } from '../../../src/adaptive-flow-renderer/models/GraphNode';

describe('ifElseLayouter', () => {
  let botAsksNode, userAnswersNode, invalidPromptNode;

  beforeEach(() => {
    botAsksNode = new GraphNode('1', {}, new Boundary(200, 60));
    userAnswersNode = new GraphNode('1', {}, new Boundary(200, 60));
    invalidPromptNode = new GraphNode('1', {}, new Boundary(24, 24));
  });

  it('should reuturn a graphLayout whose edges count is 6', () => {
    expect(baseInputLayouter(botAsksNode, userAnswersNode, invalidPromptNode).edges.length).toEqual(6);
  });
});
