// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';

import { ElementWrapper } from '../../../src/adaptive-flow-editor/renderers/ElementWrapper';

describe('<ElementWrapper>', () => {
  it('can render.', () => {
    const ele = render(
      <ElementWrapper nodeId="test" tagId="1">
        <span data-testid="wrapped-content">Content</span>
      </ElementWrapper>
    );

    expect(ele).toBeTruthy();
    expect(ele.getByTestId('wrapped-content')).toBeTruthy();
    expect(ele.getByTestId('wrapped-content').textContent).toEqual('Content');
  });
});
