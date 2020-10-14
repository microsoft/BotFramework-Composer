// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { LoopIndicator } from '../../../src/adaptive-flow-renderer/components/LoopIndicator';

describe('<LoopIndicator />', () => {
  it('can be rendered.', () => {
    const loopIndicator = render(<LoopIndicator onClick={() => null} />);
    expect(loopIndicator.getByTestId('LoopIndicator')).toBeTruthy();
  });
});
