// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render, act } from '@botframework-composer/test-utils';
import assign from 'lodash/assign';

import { LoadingTimeout } from '../LoadingTimeout';

const defaultProps = {
  timeout: 500,
  children: <div />,
};

function renderSubject(overrides = {}) {
  const { children, ...rest } = assign({}, defaultProps, overrides);
  return render(<LoadingTimeout {...rest}>{children}</LoadingTimeout>);
}

describe('<LoadingTimeout />', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders a spinner with "Loading"', () => {
    const { container } = renderSubject();
    expect(container).toHaveTextContent('Loading');
  });

  it('displays children after timeout', async () => {
    const fallback = <div>Fallback content</div>;
    const { container } = renderSubject({ children: fallback });
    expect(container).toHaveTextContent('Loading');

    await act(async () => {
      jest.advanceTimersByTime(499);
      expect(container).toHaveTextContent('Loading');
      jest.advanceTimersByTime(2);
      expect(container).toHaveTextContent('Fallback content');
    });
  });
});
