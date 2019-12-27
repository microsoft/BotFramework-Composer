// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, render } from 'react-testing-library';

import { RecentBotList } from '../../src/pages/home/RecentBotList';
import { ExampleList } from '../../src/pages/home/ExampleList';
import { ToolBar } from '../../src/components/ToolBar/index';
describe('<Home/>', () => {
  it('should dispatch onSelectionChanged event when clicked on a link on <RecentBotList>', () => {
    const recentProjects = [
      { dataModified: 'Thu Nov 28 2019 17:22:19 GMT+0800 (GMT+08:00)', name: 'a', path: 'path1', storageId: 'default' },
      { dataModified: 'Thu Nov 28 2019 17:22:19 GMT+0800 (GMT+08:00)', name: 'b', path: 'path2', storageId: 'default' },
    ];
    const onSelectionChanged = jest.fn(item => item.path);
    const { container, queryByLabelText } = render(
      <RecentBotList onSelectionChanged={onSelectionChanged} recentProjects={recentProjects} />
    );
    expect(container).toHaveTextContent('a');
    expect(container).toHaveTextContent('b');
    const link = queryByLabelText('a');
    fireEvent.click(link);
    expect(onSelectionChanged.mock.results[0].value).toBe('path1');
  });

  it('should dispatch onClick event when clicked on an ExampleList', () => {
    const templates = [
      { description: 'echo bot', id: 'EchoBot', name: 'Echo Bot', order: 1 },
      { description: 'empty bot', id: 'EmptyBot', name: 'Empty Bot', order: 2 },
    ];
    const onClickTemplate = jest.fn(item => item);
    const { container, getByText } = render(<ExampleList onClick={onClickTemplate} examples={templates} />);
    expect(container).toHaveTextContent('Echo Bot');
    const link = getByText('Echo Bot');
    fireEvent.click(link);
    expect(onClickTemplate.mock.results[0].value).toBe('EchoBot');
  });

  it('should call onClick handler when clicked', () => {
    const setCreationFlowStatus = jest.fn(item => item);
    const items = [
      {
        type: 'action',
        text: 'New',
        buttonProps: {
          iconProps: {
            iconName: 'CirclePlus',
          },
          onClick: () => setCreationFlowStatus('NEW'),
        },
        align: 'left',
        dataTestid: 'homePage-ToolBar-New',
        disabled: false,
      },
      {
        type: 'action',
        text: 'Open',
        buttonProps: {
          iconProps: {
            iconName: 'OpenFolderHorizontal',
          },
          onClick: () => setCreationFlowStatus('OPEN'),
        },
        align: 'left',
        dataTestid: 'homePage-ToolBar-Open',
        disabled: false,
      },
      {
        type: 'action',
        text: 'Save as',
        buttonProps: {
          iconProps: {
            iconName: 'Save',
          },
          onClick: () => setCreationFlowStatus('SAVE AS'),
        },
        align: 'left',
        disabled: false,
      },
    ];
    const { container, getByText } = render(<ToolBar toolbarItems={items} />);
    expect(container).toHaveTextContent('New');
    const link = getByText('New');
    fireEvent.click(link);
    expect(setCreationFlowStatus.mock.results[0].value).toBe('NEW');
  });
});
