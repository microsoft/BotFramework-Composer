// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { Diamond } from '../../../src/adaptive-flow-renderer/components/Diamond';

describe('<Diamond />', () => {
  it('can be rendered as svg path.', () => {
    const diamond = render(<Diamond />);
    expect(diamond.baseElement.getElementsByTagName('svg')).toHaveLength(1);
    expect(diamond.baseElement.getElementsByTagName('path')).toHaveLength(1);
  });
});
