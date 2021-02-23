// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, screen } from '@botframework-composer/test-utils';

import { PVADialog } from './pvaDialog';

it('should render', async () => {
  render(<PVADialog />);

  expect(screen.getByText('Publish your bot assets from Composer directly into Power Virtual Agents.')).toBeTruthy();
});
