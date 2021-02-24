// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil } from '../../../../__tests__/testUtils/renderWithRecoil';
import { DebugPanel } from '../DebugPanel/DebugPanel';

describe('<DebugPanel />', () => {
  beforeEach(() => {});

  describe('<DebugPanel />', () => {
    it('should not poll if bot is started', async () => {
      const { findByText } = renderWithRecoil(<DebugPanel />, ({ set }) => {});
      await findByText('Problems');
    });
  });
});
