// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { FlowEdges } from '../../../src/adaptive-flow-renderer/components/FlowEdges';
import { Edge } from '../../../src/adaptive-flow-renderer/models/EdgeData';

describe('<FlowEdges />', () => {
  it('can render edges as a group', () => {
    const edge = { id: 'test', x: 0, y: 0, direction: 'Up', length: 100 } as Edge;
    const edges = [edge, edge, edge];

    const flowEdges = render(<FlowEdges edges={edges} />);
    expect(flowEdges.baseElement.getElementsByTagName('line')).toHaveLength(3);
  });
});
