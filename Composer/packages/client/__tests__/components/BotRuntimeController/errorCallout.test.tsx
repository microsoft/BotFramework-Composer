// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render } from '@botframework-composer/test-utils';

import { ErrorCallout } from '../../../src/components/BotRuntimeController/ErrorCallout';

describe('<ErrorCallout />', () => {
  it('should render the <ErrorCallout />', () => {
    render(<ErrorCallout error={{ title: 'title test', message: 'message test' }} />);

    const container = document.querySelector('[data-testid="errorCallout"]');
    expect(container).toHaveTextContent('title test');
  });
});
