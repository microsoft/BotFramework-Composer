// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent } from '@botframework-composer/test-utils';

import { ErrorInfo } from '../../../src/components/BotRuntimeController/ErrorInfo';

describe('<ErrorInfo />', () => {
  it('should render <ErrorInfo />', () => {
    const onClick = jest.fn(() => {});
    const { container, getByText } = render(<ErrorInfo count={5} hidden={false} onClick={onClick} />);

    expect(container).toHaveTextContent('5');

    const button = getByText('5');
    fireEvent.click(button);
    expect(onClick).toBeCalledTimes(1);
  });
});
