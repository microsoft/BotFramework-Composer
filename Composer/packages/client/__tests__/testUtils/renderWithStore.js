// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@testing-library/react';

import { StoreProvider } from '../../src/store';

export const renderWithStore = children => {
  return render(<StoreProvider>{children}</StoreProvider>);
};
