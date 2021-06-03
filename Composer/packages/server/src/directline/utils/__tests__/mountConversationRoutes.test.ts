// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mountConversationsRoutes } from '../../mountConversationRoutes';
import DLServerContext from '../../store/dlServerState';

jest.mock('express', () => ({
  Router: () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  }),
}));

describe('mountConversationRoutes', () => {
  it('can register required route methods.', () => {
    const dlState = DLServerContext.getInstance(3000);
    const router = mountConversationsRoutes(dlState);

    expect(router.get).toHaveBeenCalledWith('/conversations/ws/port', expect.any(Function));
    expect(router.post).toHaveBeenCalled();
    expect(router.put).toHaveBeenCalled();
  });
});
