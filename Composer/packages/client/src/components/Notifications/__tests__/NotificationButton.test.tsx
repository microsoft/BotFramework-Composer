// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import { renderWithRecoil } from '../../../../__tests__/testUtils';
import { notificationIdsState, notificationsState } from '../../../recoilModel';
import { NotificationButton } from '../NotificationButton';

jest.mock('../NotificationPanel', () => ({
  NotificationPanel: ({ isOpen }) => isOpen && <div data-testid="NotificationPanel" />,
}));
jest.mock('office-ui-fabric-react/lib/Button', () => ({
  IconButton: ({ children, onClick }) => (
    <button data-testid="NotificationButton" onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('<NotificationButton />', () => {
  let recoilInitState;

  beforeEach(() => {
    recoilInitState = ({ set }) => {
      set(notificationIdsState, ['1', '2', '3', '4']);
      set(notificationsState('1'), { read: true });
      set(notificationsState('2'), {});
      set(notificationsState('3'), {});
      set(notificationsState('4'), {});
    };
  });

  it('displays the number of unread notifications', async () => {
    const { findByText } = renderWithRecoil(<NotificationButton />, recoilInitState);
    await findByText('3');
  });

  it('opens the notification panel', async () => {
    const { findByTestId } = renderWithRecoil(<NotificationButton />, recoilInitState);
    const notificationButton = await findByTestId('NotificationButton');

    fireEvent.click(notificationButton);

    await findByTestId('NotificationPanel');
  });
});
