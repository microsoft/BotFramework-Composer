// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { SVGContainer } from '../../../src/adaptive-flow-renderer/components/SVGContainer';

describe('<SVGContainer />', () => {
  it('should be rendered with given testid.', () => {
    const svgContainer = render(
      <SVGContainer>
        <></>
      </SVGContainer>
    );

    expect(svgContainer).toBeTruthy();
    expect(svgContainer.baseElement.getElementsByTagName('svg')).toHaveLength(1);
  });

  it('could wrap given children.', () => {
    const svgContainer = render(
      <SVGContainer>
        <circle data-testid="svg-content" />
      </SVGContainer>
    );

    expect(svgContainer.getByTestId('svg-content')).toBeTruthy();
  });
});
