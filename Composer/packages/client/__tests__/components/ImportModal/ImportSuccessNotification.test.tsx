// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { render } from '@botframework-composer/test-utils';
import React from 'react';

import { ImportSuccessNotificationWrapper } from '../../../src/components/ImportModal/ImportSuccessNotification';

describe('<ImportSuccessNotificationWrapper />', () => {
  it('should render the component', async () => {
    const locationMock = './existBot';
    const mockImportedToExisting = true;
    const Notification = ImportSuccessNotificationWrapper({
      location: locationMock,
      importedToExisting: mockImportedToExisting,
    });
    const { findByText } = render(<Notification title="test" type="success" />);

    expect(findByText('./existBot')).not.toBeUndefined();
  });
});
