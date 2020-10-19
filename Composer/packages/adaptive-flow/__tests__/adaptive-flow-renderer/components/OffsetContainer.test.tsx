// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { OffsetContainer } from '../../../src/adaptive-flow-renderer/components/OffsetContainer';

describe('<OffsetContainer />', () => {
  it('should be rendererd.', () => {
    const offsetContainer = render(
      <OffsetContainer offset={{ x: 0, y: 0 }}>
        <></>
      </OffsetContainer>
    );

    expect(offsetContainer).toBeTruthy();
    expect(offsetContainer.getByTestId('OffsetContainer')).toBeTruthy();
  });

  it('should be rendererd with given children.', () => {
    const offsetContainer = render(
      <OffsetContainer offset={{ x: 0, y: 0 }}>
        <div data-testid="offset-content" />
      </OffsetContainer>
    );

    expect(offsetContainer.getByTestId('offset-content')).toBeTruthy();
  });
});
