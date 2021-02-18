// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { render, screen, fireEvent } from '@botframework-composer/test-utils';
import React from 'react';

import { ItemWithTooltip } from '../ItemWithTooltip';

describe('ItemWithTooltip', () => {
  it('can be rendered correctly with normal props', async () => {
    const component = render(<ItemWithTooltip itemText="Hello" tooltipId="id" tooltipText="MyTooltip" />);
    expect(component).toBeTruthy();

    fireEvent.mouseOver(screen.getByTestId('helpIcon'));

    expect(await screen.getByText('MyTooltip')).toBeTruthy();
  });

  it('can be rendered correctly with custom itemText render', async () => {
    const component = render(<ItemWithTooltip itemText={<div>Custom</div>} tooltipId="id" tooltipText="MyTooltip" />);
    expect(component).toBeTruthy();

    fireEvent.mouseOver(screen.getByTestId('helpIcon'));

    expect(await screen.getByText('MyTooltip')).toBeTruthy();
  });
});
