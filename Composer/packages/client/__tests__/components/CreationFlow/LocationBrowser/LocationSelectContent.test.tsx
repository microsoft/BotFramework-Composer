// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';
import { MutableSnapshot } from 'recoil';

import { StorageFolder } from '../../../../src/recoilModel/types';
import { renderWithRecoil } from '../../../testUtils';
import { LocationSelectContent } from '../../../../src/components/CreationFlow/LocationSelectContent';
import { CreationFlowStatus } from '../../../../src/constants';
import { storageFileLoadingStatusState, creationFlowStatusState, storagesState } from '../../../../src/recoilModel';

describe('<LocationSelectContent/>', () => {
  const onCurrentPathUpdateMock = jest.fn();
  const onOpenMock = jest.fn();
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

  const storages = [
    {
      defaultPath: 'C:\\',
      id: 'default',
      name: 'This PC',
      path: 'C:/test-folder/Desktop',
      platform: 'win32',
      type: 'LocalDisk',
    },
  ];

  function renderComponent(recoilInitState: (obj: MutableSnapshot) => void) {
    return renderWithRecoil(
      <LocationSelectContent
        focusedStorageFolder={focusedStorageFolder}
        operationMode={operationMode}
        onCurrentPathUpdate={onCurrentPathUpdateMock}
        onOpen={onOpenMock}
      />,
      recoilInitState
    );
  }

  it('should render spinner', async () => {
    const component = renderComponent(({ set }) => {
      set(storageFileLoadingStatusState, 'pending');
      set(creationFlowStatusState, CreationFlowStatus.OPEN);
      set(storagesState, storages);
    });
    const spinner = await component.findByTestId('locationSelectContentSpinner');
    expect(spinner).toBeDefined();
  });

  it('fail to render FileSelector', async () => {
    const component = renderComponent(({ set }) => {
      set(storageFileLoadingStatusState, 'failure');
      set(creationFlowStatusState, CreationFlowStatus.OPEN);
      set(storagesState, storages);
    });
    expect(await component.findByText('Could not connect to storage.')).toBeInTheDocument();
  });

  it('should open folder', async () => {
    const component = renderComponent(({ set }) => {
      set(storageFileLoadingStatusState, 'success');
      set(creationFlowStatusState, CreationFlowStatus.OPEN);
      set(storagesState, storages);
    });
    const parent = await component.findByText('..');
    fireEvent.click(parent);
    expect(onCurrentPathUpdateMock).toBeCalledWith('C:/test-folder', 'default');
  });

  it('should open bot', async () => {
    const component = renderComponent(({ set }) => {
      set(storageFileLoadingStatusState, 'success');
      set(storagesState, storages);
      set(creationFlowStatusState, CreationFlowStatus.OPEN);
    });
    const bot = await component.findByText('EchoBot-0');
    fireEvent.click(bot);
    expect(onOpenMock).toBeCalledWith('C:/test-folder/Desktop/EchoBot-0', 'default');
  });
});
