// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';

import { StoreProvider } from '../../src/store';

export const renderWithStore = children => {
  return render(<StoreProvider>{children}</StoreProvider>);
};
