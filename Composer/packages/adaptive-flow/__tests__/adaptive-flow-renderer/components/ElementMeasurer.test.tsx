// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { ElementMeasurer } from '../../../src/adaptive-flow-renderer/components/ElementMeasurer';

describe('<ElementMeasurer />', () => {
  it('could wrap given content', () => {
    const ele = render(
      <ElementMeasurer onResize={() => null}>
        <div data-testid="measurer-content" />
      </ElementMeasurer>
    );

    expect(ele.getByTestId('measurer-content')).toBeTruthy();
  });
});
