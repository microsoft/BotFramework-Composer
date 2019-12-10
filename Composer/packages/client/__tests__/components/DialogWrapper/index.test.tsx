// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from 'react-testing-library';
import { DialogWrapper } from '@src/components/DialogWrapper';

describe('<DialogWrapper />', () => {
  const props = {
    isOpen: true,
    title: 'My Dialog',
    subText: 'Create new dialog',
    onDismiss: jest.fn(),
  };

  it('renders null when not open', () => {
    const { container } = render(<DialogWrapper {...props} isOpen={false} />);
    expect(container.hasChildNodes()).toBeFalsy();
  });
});
