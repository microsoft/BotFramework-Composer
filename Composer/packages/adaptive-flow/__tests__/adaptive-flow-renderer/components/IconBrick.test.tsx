// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { IconBrick } from '../../../src/adaptive-flow-renderer/components/IconBrick';

describe('<IconBrick />', () => {
  it('can be rendered.', () => {
    const iconBrick = render(<IconBrick onClick={() => null} />);
    expect(iconBrick.getByTestId('IconBrick')).toBeTruthy();
  });
});
