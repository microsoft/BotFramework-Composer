// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil } from '../../../__tests__/testUtils/renderWithRecoil';
import { NotificationCard, NotificationType, Timer } from '../NotificationCard';

jest.useFakeTimers();

describe('<NotificationCard />', () => {
  it('should render the NotificationCard', () => {
    const cardProps = {
      title: 'There was error creating your KB',
      description: 'error',
      retentionTime: 1,
      type: NotificationType.error,
    };
    const onDismiss = jest.fn();
    const { container } = renderWithRecoil(<NotificationCard cardProps={cardProps} id="test" onDismiss={onDismiss} />);

    expect(container).toHaveTextContent('There was error creating your KB');
  });

  it('should render the customized card', () => {
    const cardProps = {
      title: 'There was error creating your KB',
      description: 'error',
      retentionTime: 5000,
      type: NotificationType.error,
      onRenderCardContent: () => <div>customized</div>,
    };
    const onDismiss = jest.fn();
    const { container } = renderWithRecoil(<NotificationCard cardProps={cardProps} id="test" onDismiss={onDismiss} />);

    expect(container).toHaveTextContent('customized');
  });
});

describe('Notification Time Management', () => {
  it('should invoke callback', () => {
    const callback = jest.fn();
    new Timer(callback, 0);
    expect(callback).not.toBeCalled();
    jest.runAllTimers();
    expect(callback).toHaveBeenCalled();
  });

  it('should pause and resume', () => {
    const callback = jest.fn();
    const timer = new Timer(callback, 1);
    timer.pause();
    expect(timer.pausing).toBeTruthy();
    timer.resume();
    expect(timer.pausing).toBeFalsy();
  });
});
