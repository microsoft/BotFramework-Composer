// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { renderWithRecoil } from '../testUtils';
import { Header } from '../../src/components/Header';

describe('<Header />', () => {
  it('should render the header', () => {
    const { container } = renderWithRecoil(<Header />);

    expect(container).toHaveTextContent('Bot Framework Composer');
  });
});
