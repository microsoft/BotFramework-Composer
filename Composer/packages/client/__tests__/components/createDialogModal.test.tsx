// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';

import { CreateDialogModal } from '../../src/pages/design/createDialogModal';
import { renderWithStore } from '../testUtils';

describe('<CreateDialogModal/>', () => {
  const onSubmitMock = jest.fn();
  const onDismissMock = jest.fn();
  let storeContext;
  function renderComponent() {
    return renderWithStore(
      <CreateDialogModal isOpen onDismiss={onDismissMock} onSubmit={onSubmitMock} />,
      storeContext.state
    );
  }

  beforeEach(() => {
    storeContext = {
      state: {
        showCreateDialogModal: true,
        dialogs: [],
      },
    };
  });

  it('should render the component', () => {
    const component = renderComponent();
    expect(component.container).toBeDefined();
  });

  it('does not allow submission when the name is invalid', async () => {
    const component = renderComponent();
    const nameField = await component.getByTestId('NewDialogName');
    fireEvent.change(nameField, { target: { value: 'invalidName;' } });
    const node = await component.getByTestId('SubmitNewDialogBtn');
    expect(node).toBeDisabled();
  });
});
