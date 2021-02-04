// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, waitFor } from '@botframework-composer/test-utils';
import { EditorExtension, PluginConfig } from '@bfc/extension-client';

import { TriggerCreationModal } from '../../../src/components/TriggerCreationModal';
import { renderWithRecoil } from '../../testUtils';

const projectId = '123a-bv3c4';

describe('<TriggerCreationModal/>', () => {
  const onSubmitMock = jest.fn();
  const onDismissMock = jest.fn();

  const pluginsStub: PluginConfig = {
    uiSchema: {
      'Microsoft.OnIntent': {
        trigger: {
          label: 'Intent recognized',
          order: 1,
        },
      },
      'Microsoft.OnQnAMatch': {
        trigger: {
          label: 'QnA Intent recognized',
          order: 2,
        },
      },
    },
  };

  function renderComponent() {
    return renderWithRecoil(
      <EditorExtension plugins={pluginsStub} projectId={''} shell={{ api: {} as any, data: {} as any }}>
        <TriggerCreationModal
          isOpen
          dialogId={'todobot'}
          projectId={projectId}
          onDismiss={onDismissMock}
          onSubmit={onSubmitMock}
        />
      </EditorExtension>
    );
  }

  it('should render the component', () => {
    const component = renderComponent();
    expect(component.container).toBeDefined();
  });

  it('should create a Luis Intent recognized', async () => {
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
