import { render } from '@botframework-composer/test-utils';
import React from 'react';
import { ImportSuccessNotificationWrapper } from '../../../src/components/ImportModal/ImportSuccessNotification';

describe('<ImportSuccessNotificationWrapper />', () => {
  it('should render the component', async () => {
    let locationMock = './existBot';
    const mockImportedToExisting = true;
    const Notification = ImportSuccessNotificationWrapper({
      location: locationMock,
      importedToExisting: mockImportedToExisting,
    });
    const { findByText } = render(<Notification type="success" title="test" />);

    expect(findByText('./existBot')).not.toBeUndefined();
  });
});
