// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fireEvent, render, screen } from '@botframework-composer/test-utils';
import React from 'react';

import { withTooltip } from '../withTooltip';

describe('withTooltip', () => {
  it('can be rendered correctly', async () => {
    const Component = ({ text }: { text: string }) => <div>{text}</div>;
    const ComponentWithTooltip = withTooltip({ content: 'Tooltip' }, Component);

    const component = render(<ComponentWithTooltip text="Hello!" />);
    expect(component).toBeTruthy();

    fireEvent.mouseOver(screen.getByText('Hello!'));

    expect(await screen.getByText('Tooltip')).toBeTruthy();
  });
});
