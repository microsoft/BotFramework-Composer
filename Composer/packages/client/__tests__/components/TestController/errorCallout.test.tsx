// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent, getByText } from '@botframework-composer/test-utils';

import { ErrorCallout } from '../../../src/components/TestController/errorCallout';

describe('<ErrorCallout />', () => {
  it('should render the <ErrorCallout />', () => {
    const onDismiss = jest.fn(() => {});
    const onTry = jest.fn(() => {});

    render(
      <ErrorCallout
        visible
        error={{ title: 'title test', message: 'message test' }}
        target={null}
        onDismiss={onDismiss}
        onTry={onTry}
      />
    );

    const container = document.querySelector('[ data-testid="errorCallout"]');
    expect(container).toHaveTextContent('title test');

    const tryButton = getByText(container as HTMLElement, 'Try again');
    const cancelButton = getByText(container as HTMLElement, 'Cancel');
    fireEvent.click(tryButton);
    fireEvent.click(cancelButton);
    expect(onTry).toBeCalledTimes(1);
    expect(onDismiss).toBeCalledTimes(1);
  });
});
