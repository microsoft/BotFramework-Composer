// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { setIconOptions } from 'office-ui-fabric-react/lib/Styling';
import 'jest-dom/extend-expect';
import { cleanup } from 'react-testing-library';

// Suppress icon warnings.
setIconOptions({
  disableWarnings: true,
});

formatMessage.setup({
  missingTranslation: 'ignore',
});

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

afterEach(cleanup);
