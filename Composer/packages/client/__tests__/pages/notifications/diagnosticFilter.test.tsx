// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, render } from '@botframework-composer/test-utils';

import { DiagnosticFilter } from '../../../src/pages/diagnostics/DiagnosticFilter';

describe('<NotificationFilter/>', () => {
  it('should render the DiagnosticFilter', () => {
    const mockOnChange = jest.fn(() => null);
    const { container } = render(<DiagnosticFilter onChange={mockOnChange} />);

    expect(container).toHaveTextContent('All');
    const dropdown: any = container.querySelector('[data-testid="notifications-dropdown"]');
    fireEvent.click(dropdown);
    const test = document.querySelector('.ms-Dropdown-callout');
    expect(test).toHaveTextContent('Error');
    expect(test).toHaveTextContent('Warning');
  });
});
