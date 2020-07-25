// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, render } from '@bfc/test-utils';
import { ProjectTemplate } from '@bfc/shared';

import { RecentBotList } from '../../src/pages/home/RecentBotList';
import { ExampleList } from '../../src/pages/home/ExampleList';
import { renderWithRecoil } from '../testUtils';
import { Toolbar } from '../../src/components/Toolbar';
describe('<Home/>', () => {
  it('should dispatch onSelectionChanged event when clicked on a link on <RecentBotList>', () => {
    const recentProjects = [
      { dataModified: 'Thu Nov 28 2019 17:22:19 GMT+0800 (GMT+08:00)', name: 'a', path: 'path1', storageId: 'default' },
      { dataModified: 'Thu Nov 28 2019 17:22:19 GMT+0800 (GMT+08:00)', name: 'b', path: 'path2', storageId: 'default' },
    ];
    const onItemChosen = jest.fn((item) => item.path);
    const { container, queryByLabelText } = render(
      <RecentBotList recentProjects={recentProjects} onItemChosen={onItemChosen} />
    );
    expect(container).toHaveTextContent('a');
    expect(container).toHaveTextContent('b');
    const link = queryByLabelText('Bot name is a');
    if (link) {
      fireEvent.dblClick(link);
      expect(onItemChosen.mock.results[0].value).toBe('path1');
    }
  });

  it('should dispatch onClick event when clicked on an ExampleList', () => {
    const templates = [
      { description: 'echo bot', id: 'EchoBot', name: 'Echo Bot' },
      { description: 'empty bot', id: 'EmptyBot', name: 'Empty Bot' },
    ] as ProjectTemplate[];
    const onClickTemplate = jest.fn((item) => item);
    const { container, getByText } = render(<ExampleList examples={templates} onClick={onClickTemplate} />);
    expect(container).toHaveTextContent('Echo Bot');
    const link = getByText('Echo Bot');
    fireEvent.click(link);
    expect(onClickTemplate.mock.results[0].value).toBe('EchoBot');
  });

  it('should call onClick handler when clicked', () => {
    const setCreationFlowStatus = jest.fn((item) => item);
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
        dataTestid: 'homePage-Toolbar-New',
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
        dataTestid: 'homePage-Toolbar-Open',
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
    const { container, getByText } = renderWithRecoil(<Toolbar toolbarItems={items} />);
    expect(container).toHaveTextContent('New');
    const link = getByText('New');
    fireEvent.click(link);
    expect(setCreationFlowStatus.mock.results[0].value).toBe('NEW');
  });
});
