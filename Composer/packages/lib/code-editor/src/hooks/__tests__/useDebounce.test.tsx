// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { act, render, screen } from '@botframework-composer/test-utils';
import React from 'react';

import { useDebounce } from '../useDebounce';

beforeAll(() => {
  jest.useFakeTimers();
});
afterAll(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('useDebounce', () => {
  it('put initialized value in first render', () => {
    function Component() {
      const value = useDebounce('Hello world', 1000);
      return <div>{value}</div>;
    }
    render(<Component />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('will update value when timer is called', () => {
    function Component({ text }) {
      const value = useDebounce(text, 1000);
      return <div>{value}</div>;
    }
    const { rerender } = render(<Component text="Hello" />);

    // check initial value
    expect(screen.getByText('Hello')).toBeInTheDocument();

    rerender(<Component text="Hello World!" />);

    // timeout shouldn't have called yet
    expect(screen.getByText('Hello')).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    // after runAllTimer text should be updated
    expect(screen.getByText('Hello World!')).toBeInTheDocument();
  });
});
