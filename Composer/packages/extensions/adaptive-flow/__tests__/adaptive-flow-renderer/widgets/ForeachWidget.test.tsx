// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';

import { ForeachWidget } from '../../../src/adaptive-flow-renderer/widgets';
import { AdaptiveKinds } from '../../../src/adaptive-flow-renderer/constants/AdaptiveKinds';

describe('ForeachWidget', () => {
  it('can be rendered correctly.', () => {
    const foreachNode = render(
      <ForeachWidget
        data={{ $kind: AdaptiveKinds.Foreach }}
        id="test"
        loop={<span data-testid="test-loop">Loop Head</span>}
        onEvent={() => null}
      />
    );
    expect(foreachNode).toBeTruthy();
    expect(foreachNode.getByTestId('test-loop')).toBeTruthy();
  });
});
