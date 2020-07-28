// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, act, waitFor } from '@bfc/test-utils';

import { renderWithRecoil } from '../../../testUtils';
import { StorageFolder } from '../../../../src/recoilModel/types';
import { focusedStorageFolderState, storagesState } from '../../../../src/recoilModel';
import DefineConversation from '../../../../src/components/CreationFlow/DefineConversation';

describe('<DefineConversation/>', () => {
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
      <DefineConversation
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
        set(focusedStorageFolderState, '');
        set(storagesState, [{ id: 'default' }]);
      }
    );
  }

  it('should render the component', () => {
    const component = renderComponent();
    expect(component.container).toBeDefined();
  });

  it('should update formdata with data passed through location props', async () => {
    locationMock = {
      search:
        'schemaUrl%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2Fmicrosoft%2Fbotframework-sdk%2Fmaster%2Fschemas%2Fcomponent%2Fcomponent.schema%26name%3DEchoBot-11299%26description%3DTest%20Echo',
    };
    const component = renderComponent();
    const node = await component.findByText('OK');
    fireEvent.click(node);
    expect(
      onSubmitMock.mock.calls[0][0] ===
        {
          description: 'Test Echo',
          name: 'EchoBot-11299',
          location: '\\test-folder\\Desktop',
          schemaUrl:
            'https://raw.githubusercontent.com/microsoft/botframework-sdk/master/schemas/component/component.schema',
        } ||
        onSubmitMock.mock.calls[0][0] ===
          {
            description: 'Test Echo',
            name: 'EchoBot-11299',
            location: '/test-folder/Desktop',
            schemaUrl:
              'https://raw.githubusercontent.com/microsoft/botframework-sdk/master/schemas/component/component.schema',
          }
    ).toBeTruthy;
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
