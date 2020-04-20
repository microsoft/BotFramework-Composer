// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

expect.extend({
  toBeDispatchedWith(dispatch: jest.Mock, type: string, payload: any, error?: any) {
    if (this.isNot) {
      expect(dispatch).not.toHaveBeenCalledWith({
        type,
        payload,
        error,
      });
    } else {
      expect(dispatch).toHaveBeenCalledWith({
        type,
        payload,
        error,
      });
    }

    return {
      pass: !this.isNot,
      message: () => 'dispatch called with correct type and payload',
    };
  },
});
