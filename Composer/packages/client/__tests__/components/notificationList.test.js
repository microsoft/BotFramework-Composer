// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render } from 'react-testing-library';

import { NotificationList } from '../../src/pages/notifications/NotificationList';

describe('<NotificationList/>', () => {
  const items = [
    { type: 'Error', location: 'test1', message: 'error1' },
    { type: 'Warning', location: 'test2', message: 'error2' },
    { type: 'Error', location: 'test3', message: 'error3' },
  ];
  it('should render the NotificationList', () => {
    const { container } = render(<NotificationList items={items} />);

    expect(container).toHaveTextContent('test1');
    expect(container).toHaveTextContent('test2');
    expect(container).toHaveTextContent('test3');
  });
});
