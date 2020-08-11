// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render } from '@bfc/test-utils';

import { ErrorBoundary } from '../../src/components/ErrorBoundary';

const ProblemChild = () => {
  throw new Error();
  // eslint-disable-next-line no-unreachable
  return <div>Error</div>;
};

describe('<ErrorBoundary/>', () => {
  let consoleErrorStub, consoleLogStub, setApplicationErrorStub, fetchProjectStub, currentApplicationError;

  beforeEach(() => {
    consoleErrorStub = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogStub = jest.spyOn(console, 'log').mockImplementation(() => {});
    setApplicationErrorStub = jest.fn();
    fetchProjectStub = jest.fn();
    currentApplicationError = undefined;
  });

  afterEach(() => {
    consoleErrorStub.mockRestore();
    consoleLogStub.mockRestore();
  });

  it('should just render the children if error not occur', () => {
    const { container } = render(
      <ErrorBoundary
        currentApplicationError={currentApplicationError}
        fetchProject={fetchProjectStub}
        setApplicationLevelError={setApplicationErrorStub}
      >
        <div>test</div>
      </ErrorBoundary>
    );
    expect(container).toHaveTextContent('test');
  });

  it('all the components will not crash with ErrorBoundary even child compoent throw a error', () => {
    const { container } = render(
      <div>
        <ErrorBoundary
          currentApplicationError={currentApplicationError}
          fetchProject={fetchProjectStub}
          setApplicationLevelError={setApplicationErrorStub}
        >
          <ProblemChild />
        </ErrorBoundary>
        <div> will not crash</div>
      </div>
    );

    expect(container).toHaveTextContent('will not crash');
    expect(setApplicationErrorStub).toHaveBeenCalledTimes(1);
  });

  it('all components will crash without ErrorBoundary to catch a error', () => {
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
