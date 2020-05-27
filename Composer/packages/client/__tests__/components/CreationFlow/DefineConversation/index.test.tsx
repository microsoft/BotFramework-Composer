// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent } from '@bfc/test-utils';

import { StoreContext } from '../../../../src/store';
import { StorageFolder } from '../../../../src/store/types';
import DefineConversation from '../../../../src/components/CreationFlow/DefineConversation';

describe('<DefineConversation/>', () => {
  let onSubmitMock;
  let onDismissMock;
  const onCurrentPathUpdateMock = jest.fn();
  let component, storeContext, saveTemplateMock, locationMock;
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
    return render(
      <StoreContext.Provider value={storeContext}>
        <DefineConversation
          focusedStorageFolder={focusedStorageFolder}
          location={locationMock}
          onCurrentPathUpdate={onCurrentPathUpdateMock}
          onDismiss={onDismissMock}
          onSubmit={onSubmitMock}
        />
      </StoreContext.Provider>
    );
  }

  beforeEach(() => {
    saveTemplateMock = jest.fn();
    locationMock = {};
    storeContext = {
      actions: {
        saveTemplateId: saveTemplateMock,
      },
      state: {
        templateId: '',
        focusedStorageFolder: '',
      },
    };

    onSubmitMock = jest.fn();
  });

  it('should render the component', () => {
    storeContext.state.storages = [];
    component = renderComponent();
    expect(component.container).toBeDefined();
  });

  it('should update formdata with data passed through location props', async () => {
    storeContext.state.storages = [];
    storeContext.state.templateId = 'EchoBot';
    locationMock = {
      search:
        'schemaUrl%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2Fmicrosoft%2Fbotframework-sdk%2Fmaster%2Fschemas%2Fcomponent%2Fcomponent.schema%26name%3DEchoBot-11299%26description%3DTest%20Echo',
    };
    component = renderComponent();
    const node = await component.findByText('Next');
    fireEvent.click(node);
    expect(onSubmitMock).toHaveBeenCalledWith({
      description: 'Test Echo',
      name: 'EchoBot-11299',
      schemaUrl:
        'https://raw.githubusercontent.com/microsoft/botframework-sdk/master/schemas/component/component.schema',
    });
  });
});
