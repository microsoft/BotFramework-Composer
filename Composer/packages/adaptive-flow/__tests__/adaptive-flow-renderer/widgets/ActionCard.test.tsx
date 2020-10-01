// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';

import { ActionCard } from '../../../src/adaptive-flow-renderer/widgets';
import { AdaptiveKinds } from '../../../src/adaptive-flow-renderer/constants/AdaptiveKinds';

describe('ActionCard', () => {
  it('can be rendered.', () => {
    const card = render(<ActionCard data={{ $kind: AdaptiveKinds.SendActivity }} id="test" onEvent={() => null} />);
    expect(card).toBeTruthy();
  });

  it('can be rendered with injected content.', () => {
    const card = render(
      <ActionCard
        body={<span data-testid="test-body">Body</span>}
        data={{ $kind: AdaptiveKinds.SendActivity }}
        footer={<span data-testid="test-footer">Footer</span>}
        header={<span data-testid="test-header">Header</span>}
        id="test"
        onEvent={() => null}
      />
    );
    expect(card.getByTestId('test-header')).toBeTruthy();
    expect(card.getByTestId('test-body')).toBeTruthy();
    expect(card.getByTestId('test-footer')).toBeTruthy();
  });
});
