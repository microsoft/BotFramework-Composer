// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, act, waitFor } from '@bfc/test-utils';

import { CreateDialogModal } from '../../src/pages/design/createDialogModal';
import { renderWithRecoil } from '../testUtils';
import { showCreateDialogModalState } from '../../src/recoilModel';

describe('<CreateDialogModal/>', () => {
  const onSubmitMock = jest.fn();
  const onDismissMock = jest.fn();

  function renderComponent() {
    return renderWithRecoil(
      <CreateDialogModal isOpen onDismiss={onDismissMock} onSubmit={onSubmitMock} />,
      ({ set }) => {
        set(showCreateDialogModalState, true);
      }
    );
  }

  it('should render the component', () => {
    const component = renderComponent();
    expect(component.container).toBeDefined();
  });

  it('does not allow submission when the name is invalid', async () => {
    const component = renderComponent();
    const nameField = component.getByTestId('NewDialogName');
    act(() => {
      fireEvent.change(nameField, { target: { value: 'invalidName;' } });
    });
    const node = await waitFor(() => component.getByTestId('SubmitNewDialogBtn'));
    expect(node).toBeDisabled();
  });
});
