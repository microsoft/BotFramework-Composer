// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, waitFor } from '@botframework-composer/test-utils';

import { ErrorMessage } from '../ErrorMessage';

describe('<ErrorMessage />', () => {
  it.each([
    ['foo', 'my error', 'foo my error'],
    ['foo', undefined, 'foo'],
    [undefined, 'my error', 'my error'],
  ])('joins label and error inside of a message bar', async (label, error, expected) => {
    const { container } = render(<ErrorMessage error={error} label={label} />);
    // the message bar delays rendering of its text content, so we need to wait
    await waitFor(() => {
      expect(container).toHaveTextContent(expected);
    });
  });

  it('renders a helpLink when present', async () => {
    const { findByTestId } = render(<ErrorMessage error="my error" helpLink="https://aka.ms" label="foo" />);
    const link = await findByTestId('ErrorMessageHelpLink');
    expect(link).toBeDefined();
  });
});
