// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent, render } from '@botframework-composer/test-utils';
import { Toolbar } from '@bfc/ui-shared';

import { RecentBotList } from '../../src/pages/home/RecentBotList';
import { WhatsNewsList } from '../../src/pages/home/WhatsNewsList';
import { CardWidget } from '../../src/pages/home/CardWidget';
import { renderWithRecoil } from '../testUtils';

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

  it("should render what's news List", () => {
    const newsList = [
      {
        title: 'Composer 1.4',
        description: "Learn about new features in Composer's latest release.",
        url: 'https://www.microsoft.com',
      },
      {
        title: 'Conversational AI at Microsoft Ignite',
        description:
          'Updates from Microsoft Ignite. New Composer release, public preview of Orchestrator and updates to Azure Bot Service and Bot Framework SDK.',
        url: 'https://www.microsoft.com',
      },
    ];
    const { container } = render(<WhatsNewsList newsList={newsList} />);
    expect(container).toHaveTextContent(newsList[0].description);
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

  it('should render resoure, article, video cards', () => {
    const videoItem = {
      image: 'https://via.placeholder.com/244x95/0078d4/ffffff?text=Bot+FrameWork+Composer',
      title: 'Introduction to Composer',
      description: 'A five minute intro to Composer',
      url: 'https://www.youtube.com/watch?v=hiIiZnRcCv0',
    };
    const { container } = renderWithRecoil(
      <CardWidget
        ariaLabel="test"
        cardType={'video'}
        content={videoItem.description}
        href={videoItem.url}
        imageCover={videoItem.image}
        title={videoItem.title}
      />
    );
    expect(container).toHaveTextContent(videoItem.title);
  });
});
