// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, render } from '@botframework-composer/test-utils';

import { NotificationHeader } from '../../src/pages/notifications/NotificationFilter';

describe('<NotificationHeader/>', () => {
  it('should render the NotificationHeader', () => {
    const mockOnChange = jest.fn(() => null);
    const { container } = render(<NotificationHeader onChange={mockOnChange} />);

    expect(container).toHaveTextContent('Notifications');
    expect(container).toHaveTextContent('All');
    const dropdown = container.querySelector('[data-testid="notifications-dropdown"]');
    fireEvent.click(dropdown);
    const test = document.querySelector('.ms-Dropdown-callout');
    expect(test).toHaveTextContent('Error');
    expect(test).toHaveTextContent('Warning');
  });
});
