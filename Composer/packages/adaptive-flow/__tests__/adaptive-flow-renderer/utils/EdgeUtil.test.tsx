// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { drawSVGEdge } from '../../../src/adaptive-flow-renderer/utils/visual/EdgeUtil';
import { EdgeDirection } from '../../../src/adaptive-flow-renderer/models/EdgeData';

describe('drawSVGEdge', () => {
  it('should render normal edge line', async () => {
    const { container } = render(<svg>{drawSVGEdge('test', 10, 10, EdgeDirection.Right, 100)}</svg>);
    const lines = await container.querySelectorAll('line');
    expect(lines.length).toEqual(1);
  });

  it('should render nothing given a zero length', async () => {
    const { container } = render(<svg>{drawSVGEdge('test', 10, 10, EdgeDirection.Right, 0)}</svg>);
    const lines = await container.querySelectorAll('line');
    expect(lines.length).toEqual(0);
  });

  it('should render an arrowhead when "directed" option set to true', async () => {
    const { container } = render(
      <svg>{drawSVGEdge('test', 10, 10, EdgeDirection.Right, 100, { directed: true })}</svg>
    );
    const lines = await container.querySelectorAll('line');
    expect(lines.length).toEqual(1);

    const arrow = await container.querySelectorAll('polyline');
    expect(arrow.length).toEqual(1);
  });

  it('should render label text when "label" is set', async () => {
    const { container } = render(
      <svg>{drawSVGEdge('test', 10, 10, EdgeDirection.Right, 100, { label: 'hello' })}</svg>
    );
    const labels = await container.querySelectorAll('text');
    expect(labels.length).toEqual(1);
    expect(labels[0].textContent).toEqual('hello');
  });
});
