// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render } from 'react-testing-library';
import formatMessage from 'format-message';

import { NotificationList } from '../../src/pages/notifications/NotificationList';

describe('<NotificationList/>', () => {
  const items = [
    {
      id: 'Main.dialog',
      severity: formatMessage('Error'),
      type: 'dialog',
      location: formatMessage('test1'),
      message: formatMessage('error1'),
      diagnostic: '',
    },
    {
      id: 'Main.lu',
      severity: formatMessage('Warning'),
      type: 'lu',
      location: formatMessage('test2'),
      message: formatMessage('error2'),
      diagnostic: '',
    },
    {
      id: 'common.lg',
      severity: formatMessage('Error'),
      type: 'lg',
      location: formatMessage('test3'),
      message: formatMessage('error3'),
      diagnostic: '',
    },
  ];
  it('should render the NotificationList', () => {
    const { container } = render(<NotificationList items={items} />);

    expect(container).toHaveTextContent('test1');
    expect(container).toHaveTextContent('test2');
    expect(container).toHaveTextContent('test3');
  });
});
