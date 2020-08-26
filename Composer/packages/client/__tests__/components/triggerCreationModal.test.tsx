// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, waitFor } from '@bfc/test-utils';

import { TriggerCreationModal } from '../../src/components/ProjectTree/TriggerCreationModal';
import { renderWithRecoil } from '../testUtils';

describe('<TriggerCreationModal/>', () => {
  const onSubmitMock = jest.fn();
  const onDismissMock = jest.fn();

  function renderComponent() {
    return renderWithRecoil(
      <TriggerCreationModal isOpen dialogId={'todobot'} onDismiss={onDismissMock} onSubmit={onSubmitMock} />
    );
  }

  it('should render the component', () => {
    const component = renderComponent();
    expect(component.container).toBeDefined();
  });

  it('hould create a Luis Intent recognized', async () => {
    const component = renderComponent();
    const triggerType = component.getByTestId('triggerTypeDropDown');
    fireEvent.click(triggerType);

    const luisOption = component.getByTitle('Intent recognized');
    fireEvent.click(luisOption);
    const node = await waitFor(() => component.getByTestId('triggerFormSubmit'));
    expect(node).toBeDisabled();
  });

  it('should create a QnA Intent recognized', async () => {
    const component = renderComponent();
    const triggerType = component.getByTestId('triggerTypeDropDown');
    fireEvent.click(triggerType);

    const qnaOption = component.getByTitle('QnA Intent recognized');
    fireEvent.click(qnaOption);

    const node = await waitFor(() => component.getByTestId('triggerFormSubmit'));
    expect(node).toBeEnabled();
  });
});
