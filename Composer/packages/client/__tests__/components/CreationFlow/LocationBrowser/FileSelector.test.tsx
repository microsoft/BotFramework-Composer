// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent, act } from '@bfc/test-utils';

import { StorageFolder } from '../../../../src/recoilModel/types';
import { FileSelector } from '../../../../src/components/CreationFlow/FileSelector';

describe('<FileSelector/>', () => {
  const onFileChosen = jest.fn();
  const checkShowItem = () => true;
  const onCurrentPathUpdate = jest.fn();
  const createFolder = jest.fn();
  const updateFolder = jest.fn();
  const operationMode = { write: true, read: true };
  const storages = [{ id: 'default' }];
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
        path: 'Desktop/EchoBot-11299',
        lastModified: 'Wed Apr 22 2020 17:51:07 GMT-0700 (Pacific Daylight Time)',
        size: 1,
      },
    ],
  };
  function renderComponent() {
    return render(
      <FileSelector
        isWindows
        checkShowItem={checkShowItem}
        createFolder={createFolder}
        focusedStorageFolder={focusedStorageFolder}
        operationMode={operationMode}
        storages={storages}
        updateFolder={updateFolder}
        onCurrentPathUpdate={onCurrentPathUpdate}
        onFileChosen={onFileChosen}
      />
    );
  }

  it('should render the component', () => {
    const component = renderComponent();
    expect(component.container).toBeDefined();
  });

  it('should open file', async () => {
    const component = renderComponent();
    const bot = await component.findByText('EchoBot-0');
    act(() => {
      fireEvent.click(bot);
    });

    expect(onFileChosen).toBeCalledWith({
      name: 'EchoBot-0',
      type: 'bot',
      path: 'Desktop/EchoBot-11299',
      lastModified: 'Wed Apr 22 2020 17:51:07 GMT-0700 (Pacific Daylight Time)',
      size: 1,
    });
  });

  it('should show parent of the current folder path in the dropdown list', async () => {
    const component = renderComponent();
    const comboBox = await component.findByTestId('FileSelectorComboBox');
    const dropdown = comboBox.querySelector('.ms-ComboBox-CaretDown-button');
    if (dropdown) {
      act(() => {
        fireEvent.click(dropdown);
      });
    }
    expect(await component.findByText('C:\\test-folder')).toBeInTheDocument();
    expect(await component.findByText('C:\\')).toBeInTheDocument();
    expect(await component.findByText('/')).toBeInTheDocument();
  });

  it('should show errors when current folder is not writable', async () => {
    const component = renderComponent();
    expect(await component.findByText('You do not have permission to save bots here')).toBeInTheDocument();
  });

  it('should create a new folder', async () => {
    const component = renderComponent();
    const createFolderBtn = await component.findByText('create new folder');
    fireEvent.click(createFolderBtn);
    const textField = await component.findByTestId('newFolderTextField');
    fireEvent.change(textField, { target: { value: 'newFolder' } });
    fireEvent.keyDown(textField, { key: 'Enter' });
    //locally this should be 'C:\\test-folder\\Desktop', but online it should be 'C:/test-folder/Desktop'
    expect(
      createFolder.mock.calls[0][0] === 'C:/test-folder/Desktop' ||
        createFolder.mock.calls[0][0] === 'C:\\test-folder\\Desktop'
    ).toBeTruthy();
    expect(createFolder.mock.calls[0][1]).toBe('newFolder');
  });
});
