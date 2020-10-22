// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fireEvent } from '@botframework-composer/test-utils';
import React from 'react';

import { renderWithRecoil } from '../../../../__tests__/testUtils';
import { Notification } from '../../../recoilModel/types';
import { NotificationPanel } from '../NotificationPanel';

jest.mock('../NotificationCard', () => ({ NotificationCard: () => <div data-testid="NotificationCard" /> }));
jest.mock('office-ui-fabric-react/lib/Button', () => ({
  ActionButton: ({ onClick }) => (
    <button data-testid="ClearAll" onClick={onClick}>
      Clear all
    </button>
  ),
  IconButton: ({ onClick }) => (
    <button data-testid="Close" onClick={onClick}>
      Close
    </button>
  ),
}));

const notifications = [{ id: '1', read: true }, { id: 2 }, { id: 3 }, { id: 4 }];

describe('<NotificationPanel />', () => {
  it('displays all the notifications', async () => {
    const { findAllByTestId } = renderWithRecoil(
      <NotificationPanel
        isOpen
        notifications={notifications as Notification[]}
        onDeleteNotification={jest.fn()}
        onDismiss={jest.fn()}
      />
    );
    const notificationCards = await findAllByTestId('NotificationCard');
    expect(notificationCards.length).toBe(4);
  });

  it('clears all the notifications', async () => {
    const deleteNotification = jest.fn();
    const { findByTestId } = renderWithRecoil(
      <NotificationPanel
        isOpen
        notifications={notifications as Notification[]}
        onDeleteNotification={deleteNotification}
        onDismiss={jest.fn}
      />
    );
    const clearAll = await findByTestId('ClearAll');

    fireEvent.click(clearAll);

    expect(deleteNotification).toBeCalledTimes(4);
  });
});
