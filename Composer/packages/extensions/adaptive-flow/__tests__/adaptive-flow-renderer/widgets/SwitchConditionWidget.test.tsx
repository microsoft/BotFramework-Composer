// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';

import { SwitchConditionWidget } from '../../../src/adaptive-flow-renderer/widgets';
import { AdaptiveKinds } from '../../../src/adaptive-flow-renderer/constants/AdaptiveKinds';

describe('SwitchConditionWidget', () => {
  it('can be rendered correctly.', () => {
    const switchCondition = render(
      <SwitchConditionWidget
        data={{ $kind: AdaptiveKinds.SwitchCondition }}
        id="test"
        judgement={<span data-testid="test-judgement">Condition Judgement</span>}
        onEvent={() => null}
      />
    );
    expect(switchCondition).toBeTruthy();
    expect(switchCondition.getByTestId('test-judgement')).toBeTruthy();
  });
});
