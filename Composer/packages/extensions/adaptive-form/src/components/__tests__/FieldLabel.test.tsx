// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';

import { FieldLabel } from '../FieldLabel';

describe('<FieldLabel />', () => {
  it('renders nothing if label not present', () => {
    const { container } = render(<FieldLabel />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a label', () => {
    const { container } = render(<FieldLabel label="My Label" />);

    expect(container).toHaveTextContent('My Label');
  });

  it('renders a description tooltip', async () => {
    const { findByTestId } = render(
      <FieldLabel description="my description" helpLink="https://aka.ms" label="My Label" />
    );

    expect(await findByTestId('FieldLabelDescriptionIcon')).toBeInTheDocument();
  });
});
