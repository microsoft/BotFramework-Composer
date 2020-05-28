// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent } from '@bfc/test-utils';

import { StoreContext } from '../../src/store';
import { CreateDialogModal } from '../../src/pages/design/createDialogModal';

describe('<CreateDialogModal/>', () => {
  let onSubmitMock;
  let onDismissMock;
  let component, storeContext;
  function renderComponent() {
    return render(
      <StoreContext.Provider value={storeContext}>
        <CreateDialogModal isOpen onDismiss={onDismissMock} onSubmit={onSubmitMock} />
      </StoreContext.Provider>
    );
  }

  beforeEach(() => {
    storeContext = {
      state: {
        showCreateDialogModal: true,
        dialogs: [],
      },
    };

    onSubmitMock = jest.fn();
  });

  it('should render the component', () => {
    component = renderComponent();
    expect(component.container).toBeDefined();
  });

  it('disable submit button', async () => {
    component = renderComponent();
    const nameField = await component.getByTestId('NewDialogName');
    fireEvent.change(nameField, { target: { value: 'invalidName;' } });
    const node = await component.getByTestId('SubmitNewDialogBtn');
    expect(node).toBeDisabled();
  });
});
