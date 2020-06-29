// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render } from '@bfc/test-utils';

import { Header } from '../../src/components/Header/Header';

describe('<Header />', () => {
  it('should render the header', () => {
    const { container } = render(<Header />);

    expect(container).toHaveTextContent('Bot Framework Composer');
  });
});
