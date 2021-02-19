// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mountAttachmentRoutes } from '../../mountAttachmentRoutes';
import DLServerContext from '../../store/dlServerState';

jest.mock('express', () => ({
  Router: () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  }),
}));

describe('mountAttachmentRoutes', () => {
  it('can register required route methods.', () => {
    const dlState = DLServerContext.getInstance(3000);
    const router = mountAttachmentRoutes(dlState);

    expect(router.get).toHaveBeenNthCalledWith(1, '/v3/attachments/:attachmentId', expect.any(Function));
    expect(router.get).toHaveBeenNthCalledWith(2, '/v3/attachments/:attachmentId/views/:viewId', expect.any(Function));
  });
});
