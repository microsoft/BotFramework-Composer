// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';

import { StorageFolder } from '../../../../src/store/types';
import { LocationSelectContent } from '../../../../src/components/CreationFlow/LocationSelectContent';
import { renderWithStore } from '../../../testUtils';
import { CreationFlowStatus } from '../../../../src/constants';

describe('<LocationSelectContent/>', () => {
  const onCurrentPathUpdateMock = jest.fn();
  const onOpenMock = jest.fn();
  const operationMode = { write: true, read: true };
  let storeContext;
  const focusedStorageFolder: StorageFolder = {
    name: 'Desktop',
    parent: 'C:/test-folder',
    writable: false,
    type: 'folder',
    path: 'C:/test-folder/Desktop',
    children: [
      {
        name: 'EchoBot-0',
        type: 'bot',
        path: 'C:/test-folder/Desktop/EchoBot-0',
        lastModified: 'Wed Apr 22 2020 17:51:07 GMT-0700 (Pacific Daylight Time)',
        size: 1,
      },
      {
        name: 'normalFile',
        type: 'other',
        path: 'Desktop/normalFile',
        lastModified: 'Wed Apr 22 2020 17:51:07 GMT-0700 (Pacific Daylight Time)',
        size: 1,
      },
    ],
  };
  function renderComponent() {
    return renderWithStore(
      <LocationSelectContent
        focusedStorageFolder={focusedStorageFolder}
        operationMode={operationMode}
        onCurrentPathUpdate={onCurrentPathUpdateMock}
        onOpen={onOpenMock}
      />,
      storeContext.state
    );
  }

  beforeEach(() => {
    storeContext = {
      state: {
        storages: [
          {
            defaultPath: 'C:\\',
            id: 'default',
            name: 'This PC',
            path: 'C:/test-folder/Desktop',
            platform: 'win32',
            type: 'LocalDisk',
          },
        ],
        storageFileLoadingStatus: 'success',
        creationFlowStatus: CreationFlowStatus.OPEN,
      },
    };
  });

  it('should render spinner', async () => {
    storeContext.state.storageFileLoadingStatus = 'pending';
    const component = renderComponent();
    const spinner = await component.findByTestId('locationSelectContentSpinner');
    expect(spinner).toBeDefined();
  });

  it('fail to render FileSelector', async () => {
    storeContext.state.storageFileLoadingStatus = 'failure';
    const component = renderComponent();
    expect(await component.findByText('Can not connect the storage.')).toBeInTheDocument();
  });

  it('should open folder', async () => {
    storeContext.state.storageFileLoadingStatus = 'success';
    const component = renderComponent();
    const parent = await component.findByText('..');
    fireEvent.click(parent);
    expect(onCurrentPathUpdateMock).toBeCalledWith('C:/test-folder', 'default');
  });

  it('should open bot', async () => {
    storeContext.state.storageFileLoadingStatus = 'success';
    const component = renderComponent();
    const bot = await component.findByText('EchoBot-0');
    fireEvent.click(bot);
    expect(onOpenMock).toBeCalledWith('C:/test-folder/Desktop/EchoBot-0', 'default');
  });
});
