// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { fireEvent } from '@botframework-composer/test-utils';
import React from 'react';

import { renderWithRecoil } from '../../../../__tests__/testUtils';
import { notificationIdsState, notificationsState } from '../../../recoilModel';
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

describe('<NotificationPanel />', () => {
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

  it('displays all the notifications', async () => {
    const { findAllByTestId } = renderWithRecoil(
      <NotificationPanel isOpen onDeleteNotification={jest.fn()} onDismiss={jest.fn()} />,
      recoilInitState
    );
    const notificationCards = await findAllByTestId('NotificationCard');
    expect(notificationCards.length).toBe(4);
  });

  it('clears all the notifications', async () => {
    const deleteNotification = jest.fn();
    const { findByTestId } = renderWithRecoil(
      <NotificationPanel isOpen onDeleteNotification={deleteNotification} onDismiss={jest.fn} />,
      recoilInitState
    );
    const clearAll = await findByTestId('ClearAll');

    fireEvent.click(clearAll);

    expect(deleteNotification).toBeCalledTimes(4);
  });
});
