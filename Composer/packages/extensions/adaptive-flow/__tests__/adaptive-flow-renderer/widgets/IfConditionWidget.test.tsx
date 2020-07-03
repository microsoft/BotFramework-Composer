// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';

import { IfConditionWidget } from '../../../src/adaptive-flow-renderer/widgets';
import { AdaptiveKinds } from '../../../src/adaptive-flow-renderer/constants/AdaptiveKinds';

describe('IfConditionWidget', () => {
  it('can be rendered correctly.', () => {
    const ifCondition = render(
      <IfConditionWidget
        data={{ $kind: AdaptiveKinds.IfCondition }}
        id="test"
        judgement={<span data-testid="test-judgement">Condition Judgement</span>}
        onEvent={() => null}
      />
    );
    expect(ifCondition).toBeTruthy();
    expect(ifCondition.getByTestId('test-judgement')).toBeTruthy();
  });
});
