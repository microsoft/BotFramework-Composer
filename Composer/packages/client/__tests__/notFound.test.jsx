// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render } from '@botframework-composer/test-utils';

import { BASEPATH } from '../src/constants';
import { NotFound } from '../src/components/NotFound';

describe('<NotFound />', () => {
  it('should render a not found page', async () => {
    const { findByText } = render(<NotFound />);

    await findByText(/The page you are looking for can’t be found./);
    await findByText(/404/);
  });

  it('should render null on BASEPATH', () => {
    expect(NotFound({ uri: BASEPATH })).toBeNull();
  });
});
