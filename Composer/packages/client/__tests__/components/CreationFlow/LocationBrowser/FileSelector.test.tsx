// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { render, fireEvent } from '@bfc/test-utils';

import { StorageFolder } from '../../../../src/store/types';
import { FileSelector } from '../../../../src/components/CreationFlow/LocationBrowser/FileSelector';

describe('<FileSelector/>', () => {
  const onFileChosen = jest.fn();
  const checkShowItem = () => true;
  const onCurrentPathUpdate = jest.fn();
  const operationMode = { write: true, read: true };

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
        focusedStorageFolder={focusedStorageFolder}
        operationMode={operationMode}
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
    fireEvent.click(bot);
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
    const list = await component.findByTestId('FileSelectorDropDown');
    fireEvent.click(list);
    let text = await component.findByText('C:\\test-folder');
    expect(text).toBeDefined();
    text = await component.findByText('C:\\');
    expect(text).toBeDefined();
    text = await component.findByText('/');
    expect(text).toBeDefined();
    text = await component.findByText('You do not have permission to save bots here');
    expect(text).toBeDefined();
  });

  it('should show errors when current folder is not writable', async () => {
    const component = renderComponent();
    const text = await component.findByText('You do not have permission to save bots here');
    expect(text).toBeDefined();
  });
});
