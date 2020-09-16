// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';

import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';

describe('<DialogWrapper />', () => {
  const props = {
    isOpen: true,
    title: 'My Dialog',
    subText: 'Create new dialog',
    onDismiss: jest.fn(),
    dialogType: DialogTypes.CreateFlow,
  };

  it('renders null when not open', () => {
    const { container } = render(<DialogWrapper {...props} isOpen={false} />);
    expect(container.hasChildNodes()).toBeFalsy();
  });
});
