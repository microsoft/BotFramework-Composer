// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render } from 'react-testing-library';

import { ErrorBoundary } from '../../src/components/ErrorBoundary/index';

const Store = React.createContext({
  actions: {
    setError: () => {
      // no-op
    },
  },
  state: {
    error: null,
  },
});

const ProblemChild = () => {
  throw new Error();
  // eslint-disable-next-line no-unreachable
  return <div>Error</div>;
};

describe('<ErrorBoundary/>', () => {
  it('should just render the children if error not occur', () => {
    ErrorBoundary.contextType = Store;
    const { container, debug } = render(
      <ErrorBoundary>
        <div>test</div>
      </ErrorBoundary>
    );
    debug();
    expect(container).toHaveTextContent('test');
  });

  it('all the components will not crash with ErrorBoundary even child compoent throw a error', () => {
    ErrorBoundary.contextType = Store;
    const { container, debug } = render(
      <div>
        <ErrorBoundary>
          <ProblemChild />
        </ErrorBoundary>
        <div> will not crash</div>
      </div>
    );
    debug();
    expect(container).toHaveTextContent('will not crash');
  });

  it('all components will crash without ErrorBoundary to catch a error', () => {
    ErrorBoundary.contextType = Store;
    expect(() =>
      render(
        <div>
          <ProblemChild />
          <div> will not crash</div>
        </div>
      )
    ).toThrow();
  });
});
