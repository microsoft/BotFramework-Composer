// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';

import { PromptWidget } from '../../../src/adaptive-flow-renderer/widgets';
import { AdaptiveKinds } from '../../../src/adaptive-flow-renderer/constants/AdaptiveKinds';

describe('PromptWidget', () => {
  it('can be rendered correctly.', () => {
    const promptNode = render(
      <PromptWidget
        botAsks={<span data-testid="test-botAsks">BotAsks</span>}
        data={{ $kind: AdaptiveKinds.TextInput }}
        id="test"
        userInput={<span data-testid="test-userInput">UserInput</span>}
        onEvent={() => null}
      />
    );
    expect(promptNode).toBeTruthy();
    expect(promptNode.getByTestId('test-botAsks')).toBeTruthy();
    expect(promptNode.getByTestId('test-userInput')).toBeTruthy();
  });
});
