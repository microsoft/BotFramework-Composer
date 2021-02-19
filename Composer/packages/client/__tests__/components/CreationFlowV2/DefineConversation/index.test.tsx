// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, act, waitFor } from '@botframework-composer/test-utils';

import { renderWithRecoil } from '../../../testUtils';
import { StorageFolder } from '../../../../src/recoilModel/types';
import { focusedStorageFolderState, storagesState } from '../../../../src/recoilModel';
import DefineConversationV2 from '../../../../src/components/CreationFlow/v2/DefineConversation';

describe('<DefineConversationV2/>', () => {
  const onCurrentPathUpdateMock = jest.fn();
  const onSubmitMock = jest.fn();
  const onDismissMock = jest.fn();
  const createFolder = jest.fn();
  const updateFolder = jest.fn();
  let locationMock;
  const focusedStorageFolder: StorageFolder = {
    name: 'Desktop',
    parent: '/test-folder',
    writable: true,
    type: 'folder',
    path: '/test-folder/Desktop',
    children: [
      {
        name: 'EchoBot-0',
        type: 'bot',
        path: 'Desktop/EchoBot-11299',
        lastModified: 'Wed Apr 22 2020 17:51:07 GMT-0700 (Pacific Daylight Time)',
        size: 1,
      },
    ],
  };
  function renderComponent() {
    return renderWithRecoil(
      <DefineConversationV2
        createFolder={createFolder}
        focusedStorageFolder={focusedStorageFolder}
        location={locationMock}
        templateId={'EchoBot'}
        updateFolder={updateFolder}
        onCurrentPathUpdate={onCurrentPathUpdateMock}
        onDismiss={onDismissMock}
        onSubmit={onSubmitMock}
      />,
      ({ set }) => {
        set(focusedStorageFolderState, {} as StorageFolder);
        set(storagesState, [{ id: 'default' }]);
      }
    );
  }

  it('should render the component', () => {
    const component = renderComponent();
    expect(component.container).toBeDefined();
  });

  it('does not allow submission when the name is invalid', async () => {
    const component = renderComponent();
    const nameField = await component.getByTestId('NewDialogName');
    act(() => {
      fireEvent.change(nameField, { target: { value: 'invalidName;' } });
    });

    const node = await waitFor(() => component.getByTestId('SubmitNewBotBtn'));
    expect(node).toBeDisabled();
  });
});
