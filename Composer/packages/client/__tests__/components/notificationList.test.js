// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render } from 'react-testing-library';

import { NotificationList } from '../../src/pages/notifications/NotificationList';

describe('<NotificationList/>', () => {
  const items = [
    { id: '1', severity: 'Error', type: 'dialog', location: 'test1', message: 'error1', diagnostic: '' },
    { id: '2', severity: 'Warning', type: 'lu', location: 'test2', message: 'error2', diagnostic: '' },
    { id: '3', severity: 'Error', type: 'lg', location: 'test3', message: 'error3', diagnostic: '' },
  ];
  it('should render the NotificationList', () => {
    const { container } = render(<NotificationList items={items} />);

    expect(container).toHaveTextContent('test1');
    expect(container).toHaveTextContent('test2');
    expect(container).toHaveTextContent('test3');
  });
});
