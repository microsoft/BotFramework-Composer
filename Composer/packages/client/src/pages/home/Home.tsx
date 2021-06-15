// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Image, ImageFit } from 'office-ui-fabric-react/lib/Image';
import { Pivot, PivotItem, PivotLinkSize } from 'office-ui-fabric-react/lib/Pivot';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { RouteComponentProps } from '@reach/router';
import { navigate } from '@reach/router';
import { useRecoilValue } from 'recoil';
import { Toolbar, IToolbarItem } from '@bfc/ui-shared';

import { CreationFlowStatus } from '../../constants';
import { dispatcherState } from '../../recoilModel';
import {
  recentProjectsState,
  feedState,
  warnAboutDotNetState,
  warnAboutFunctionsState,
} from '../../recoilModel/atoms/appState';
import TelemetryClient from '../../telemetry/TelemetryClient';
import composerDocumentIcon from '../../images/composerDocumentIcon.svg';
import stackoverflowIcon from '../../images/stackoverflowIcon.svg';
import githubIcon from '../../images/githubIcon.svg';
import noRecentBotsCover from '../../images/noRecentBotsCover.svg';
import { InstallDepModal } from '../../components/InstallDepModal';
import { missingDotnetVersionError, missingFunctionsError } from '../../utils/runtimeErrors';
import SurveyNotification from '../../components/Notifications/SurveyNotification';

import { RecentBotList } from './RecentBotList';
import { WhatsNewsList } from './WhatsNewsList';
import { CardWidget } from './CardWidget';
import * as home from './styles';

const resources = [
  {
    imageCover: composerDocumentIcon,
    title: formatMessage('Documentation'),
    description: formatMessage('Everything you need to build sophisticated conversational experiences'),
    moreText: formatMessage('Learn more'),
    url: 'https://docs.microsoft.com/en-us/composer/',
  },
  {
    imageCover: githubIcon,
    title: formatMessage('GitHub'),
    description: formatMessage('View documentation, samples, and extensions'),
    moreText: formatMessage('Open GitHub'),
    url: 'https://github.com/microsoft/BotFramework-Composer',
  },
  {
    imageCover: githubIcon,
    title: formatMessage('Bot Framework Emulator'),
    description: formatMessage('Test and debug your bots in Bot Framework Emulator'),
    moreText: formatMessage('Download Emulator'),
    url: 'https://github.com/microsoft/BotFramework-Emulator/releases',
  },
  {
    imageCover: stackoverflowIcon,
    title: formatMessage('Stack Overflow'),
    description: formatMessage('Connect with the community to ask and answer questions about Composer'),
    moreText: formatMessage('Go to Stack Overflow'),
    url: 'https://stackoverflow.com/questions/tagged/botframework',
  },
];

const Home: React.FC<RouteComponentProps> = () => {
  // These variables are used in the save as method which is currently disabled until we
  // determine the appropriate save as behavior for parent bots and skills. Since we are
  // planning to add the feature back in the next release, I am commenting out this section
  // of code instead of removing it. See comment below for more details.
  //
  // const projectId = useRecoilValue<string>(currentProjectIdState);
  // const botName = useRecoilValue<string>(botDisplayNameState(projectId));
  // const templateId = useRecoilValue<string>(templateIdState);

  const recentProjects = useRecoilValue(recentProjectsState);
  const feed = useRecoilValue(feedState);
  const {
    openProject,
    setCreationFlowStatus,
    setCreationFlowType,
    setWarnAboutDotNet,
    setWarnAboutFunctions,
  } = useRecoilValue(dispatcherState);
  const warnAboutDotNet = useRecoilValue(warnAboutDotNetState);
  const warnAboutFunctions = useRecoilValue(warnAboutFunctionsState);

  const onItemChosen = async (item) => {
    if (item?.path) {
      await openProject(item.path, 'default', true, null, (projectId) => {
        TelemetryClient.track('BotProjectOpened', { method: 'list', projectId });
      });
    }
  };

  const onClickNewBot = () => {
    setCreationFlowType('Bot');
    setCreationFlowStatus(CreationFlowStatus.NEW);
    navigate(`projects/create`);
  };

  const toolbarItems: IToolbarItem[] = [
    {
      type: 'action',
      text: formatMessage('Create new'),
      buttonProps: {
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => {
          onClickNewBot();
          TelemetryClient.track('ToolbarButtonClicked', { name: 'new' });
        },
        styles: home.toolbarFirstButtonStyles,
      },
      align: 'left',
      dataTestid: 'homePage-Toolbar-New',
      disabled: false,
    },
    {
      type: 'action',
      text: formatMessage('Open'),
      buttonProps: {
        iconProps: {
          iconName: 'OpenFolderHorizontal',
        },
        onClick: () => {
          setCreationFlowStatus(CreationFlowStatus.OPEN);
          navigate(`projects/open`);
          TelemetryClient.track('ToolbarButtonClicked', { name: 'openBot' });
        },
        styles: home.toolbarButtonStyles,
      },
      align: 'left',
      dataTestid: 'homePage-Toolbar-Open',
      disabled: false,
    },
    // We are temporarily disabling the save as button until we can
    // determine what the appropriate save as behavior should be for both
    // parent bots and skills.
    //
    // Associated issue:
    // https://github.com/microsoft/BotFramework-Composer/issues/6808#issuecomment-828758688
    //
    // {
    //   type: 'action',
    //   text: formatMessage('Save as'),
    //   buttonProps: {
    //     iconProps: {
    //       iconName: 'Save',
    //     },
    //     onClick: () => {
    //       setCreationFlowStatus(CreationFlowStatus.SAVEAS);
    //       navigate(`projects/${projectId}/${templateId}/save`);
    //       TelemetryClient.track('ToolbarButtonClicked', { name: 'saveAs' });
    //     },
    //     styles: home.toolbarButtonStyles,
    //   },
    //   align: 'left',
    //   disabled: botName ? false : true,
    // },
  ];

  return (
    <div css={home.outline}>
      <div css={home.page}>
        <h1 css={home.title}>{formatMessage(`Welcome to Bot Framework Composer`)}</h1>
        <div css={home.leftPage} role="main">
          <div css={home.recentBotsContainer}>
            <h2 css={home.subtitle}>{formatMessage(`Recent`)}</h2>
            <Toolbar css={home.toolbar} toolbarItems={toolbarItems} />
            {recentProjects.length > 0 ? (
              <RecentBotList
                recentProjects={recentProjects}
                onItemChosen={async (item) => {
                  await onItemChosen(item);
                }}
              />
            ) : (
              <div css={home.noRecentBotsContainer}>
                <Image
                  alt={formatMessage('No recent bots')}
                  aria-label={formatMessage('No recent bots')}
                  css={home.noRecentBotsCover}
                  imageFit={ImageFit.centerCover}
                  src={noRecentBotsCover}
                />
                <div css={home.noRecentBotsDescription}>
                  {formatMessage.rich(
                    'Open the product tour to learn about Bot Framework Composer or <Link>create a new bot</Link>',
                    {
                      Link: ({ children }) => (
                        <Link
                          key="create-new-bot-link"
                          onClick={() => {
                            onClickNewBot();
                            TelemetryClient.track('ToolbarButtonClicked', { name: 'new' });
                          }}
                        >
                          {children}
                        </Link>
                      ),
                    }
                  )}
                </div>
              </div>
            )}
          </div>
          <div css={home.resourcesContainer}>
            <h2 css={home.subtitle}>{formatMessage('Resources')}&nbsp;</h2>
            <div css={home.rowContainer}>
              {resources.map((item, index) => (
                <CardWidget
                  key={index}
                  ariaLabel={item.title}
                  cardType={'resource'}
                  content={item.description}
                  href={item.url}
                  imageCover={item.imageCover}
                  moreLinkText={item.moreText}
                  target="_blank"
                  title={item.title}
                />
              ))}
            </div>
          </div>
          <div css={home.videosContainer}>
            <div css={home.rowContainer}>
              <Pivot aria-label="Videos and articles" css={home.pivotContainer} linkSize={PivotLinkSize.large}>
                {feed.tabs.map((tab, index) => (
                  <PivotItem key={index} headerText={tab.title}>
                    {tab.viewAllLinkText && (
                      <Link css={home.tabRowViewMore} href={tab.viewAllLinkUrl} target={'_blank'}>
                        {tab.viewAllLinkText} <Icon iconName={'OpenInNewWindow'}></Icon>{' '}
                      </Link>
                    )}
                    <div css={home.tabRowContainer}>
                      {tab.cards.map((card, index) => (
                        <CardWidget
                          key={index}
                          ariaLabel={card.title}
                          cardType={tab.title === 'Videos' ? 'video' : 'article'}
                          content={card.description}
                          href={card.url}
                          imageCover={card.image}
                          target="_blank"
                          title={card.title}
                        />
                      ))}
                    </div>
                  </PivotItem>
                ))}
              </Pivot>
            </div>
          </div>
        </div>
        <div css={home.rightPage}>
          <WhatsNewsList newsList={feed.whatsNewLinks} />
        </div>
      </div>
      {warnAboutDotNet && (
        <InstallDepModal
          downloadLink={missingDotnetVersionError.link.url}
          downloadLinkText={formatMessage('Install .NET Core SDK')}
          learnMore={{ text: formatMessage('Learn more'), link: missingDotnetVersionError.linkAfterMessage.url }}
          text={missingDotnetVersionError.message}
          title={formatMessage('.NET required')}
          onDismiss={() => setWarnAboutDotNet(false)}
        />
      )}
      {warnAboutFunctions && (
        <InstallDepModal
          downloadLink={missingFunctionsError.link.url}
          downloadLinkText={formatMessage('Install Azure Functions')}
          learnMore={{
            text: formatMessage('Learn more'),
            link: missingFunctionsError.linkAfterMessage.url,
          }}
          text={missingFunctionsError.message}
          title={formatMessage('Azure Functions required')}
          onDismiss={() => setWarnAboutFunctions(false)}
        />
      )}
      <SurveyNotification />
    </div>
  );
};

export default Home;
