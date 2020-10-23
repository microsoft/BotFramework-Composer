// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { IconButton, IButtonStyles, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { useCallback, Fragment, useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';

import {
  dispatcherState,
  appUpdateState,
  botDisplayNameState,
  localeState,
  currentProjectIdState,
  runningBotsSelector,
} from '../recoilModel';
import composerIcon from '../images/composerIcon.svg';
import { AppUpdaterStatus } from '../constants';
import { useLocation } from '../utils/hooks';

import { StartBotsPanel } from './TestController/startBotsPanel';
import { useLocalBotOperations } from './TestController/useLocalBotOperations';
export const actionButton = css`
  font-size: 18px;
  margin-top: 2px;
`;

// -------------------- Styles -------------------- //

const headerContainer = css`
  position: relative;
  background: ${SharedColors.cyanBlue10};
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const title = css`
  margin-left: 20px;
  font-weight: ${FontWeights.semibold};
  font-size: 16px;
  color: #fff;
`;

const botName = css`
  margin-left: 20px;
  font-size: 16px;
  color: #fff;
`;

const divider = css`
  height: 24px;
  border-right: 1px solid #979797;
  margin: 0px 0px 0px 20px;
`;

const updateAvailableIcon = {
  icon: {
    color: '#FFF',
    fontSize: '20px',
  },
  root: {
    height: '20px',
    width: '20px',
    margin: '0 20px',
  },
  rootHovered: {
    backgroundColor: 'transparent',
  },
  rootPressed: {
    backgroundColor: 'transparent',
  },
};

const headerTextContainer = css`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 50%;
`;

const rightSection = css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 50%;
`;

const botRuntimeStartIcon: IButtonStyles = {
  root: {
    color: `#fff`,
    marginRight: '12px',
    boxSizing: 'border-box',
    fontSize: `${FontSizes.size16}`,
    width: '20px',
  },
};

const startBotWidgetContainer = css`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
`;

// -------------------- Header -------------------- //

export const Header = () => {
  const currentLocation = useLocation();
  const { setAppUpdateShowing } = useRecoilValue(dispatcherState);
  const projectId = useRecoilValue(currentProjectIdState);
  const projectName = useRecoilValue(botDisplayNameState(projectId));
  const locale = useRecoilValue(localeState(projectId));
  const appUpdate = useRecoilValue(appUpdateState);
  const { showing, status } = appUpdate;
  const [showStartBotsPanel, setStartPanelView] = useState(false);
  const runningBots = useRecoilValue(runningBotsSelector);
  const [startPanelText, setStartPanelText] = useState('');
  const { projectIds: runningProjects } = useRecoilValue(runningBotsSelector);
  const [areBotsStarted, setBotsInBotProjectStarted] = useState<boolean>(false);
  const { stopAllBots, startAllBots } = useLocalBotOperations();
  const [showStartBotsWidget, setStartBotsWidgetVisible] = useState(true);

  useEffect(() => {
    // TODO: Start using modes to detect current page after #4361
    if (!currentLocation.location.pathname.includes('home')) {
      setStartBotsWidgetVisible(true);
      return;
    }
    setStartBotsWidgetVisible(false);
  }, [currentLocation]);

  useEffect(() => {
    if (runningProjects.length > 0) {
      setBotsInBotProjectStarted(true);
    }
  }, [runningProjects]);

  useEffect(() => {
    if (runningBots.projectIds.length > 0) {
      setStartPanelText(
        `${formatMessage('Stop all bots')} (${runningBots.projectIds.length}/${runningBots.totalBots}) ${formatMessage(
          'running'
        )})`
      );
    } else {
      setStartPanelText(formatMessage('Start all bots'));
    }
  }, [runningBots]);

  const onUpdateAvailableClick = useCallback(() => {
    setAppUpdateShowing(true);
  }, []);

  function dismissStartPanelViewer() {
    setStartPanelView(false);
  }

  function handleStartOrStopAll() {
    if (areBotsStarted) {
      stopAllBots();
      dismissStartPanelViewer();
      setBotsInBotProjectStarted(false);
    } else {
      startAllBots();
      setStartPanelView(true);
    }
  }

  const showUpdateAvailableIcon = status === AppUpdaterStatus.UPDATE_AVAILABLE && !showing;

  return (
    <div css={headerContainer} role="banner">
      <img
        alt={formatMessage('Composer Logo')}
        aria-label={formatMessage('Composer Logo')}
        src={composerIcon}
        style={{ marginLeft: '9px' }}
      />
      <div css={headerTextContainer}>
        <div css={title}>{formatMessage('Bot Framework Composer')}</div>
        {projectName && (
          <Fragment>
            <div css={divider} />
            <span css={botName}>{`${projectName} (${locale})`}</span>
          </Fragment>
        )}
      </div>

      <div css={rightSection}>
        {showStartBotsWidget && (
          <div css={startBotWidgetContainer}>
            {runningBots.projectIds.length > 0 ? (
              <ActionButton css={actionButton} onClick={handleStartOrStopAll}>
                <Icon iconName={'CircleStopSolid'} styles={botRuntimeStartIcon} />
              </ActionButton>
            ) : (
              <ActionButton css={actionButton} onClick={handleStartOrStopAll}>
                <Icon iconName={'Play'} styles={botRuntimeStartIcon} />
              </ActionButton>
            )}
            <span>{startPanelText}</span>
            <ActionButton css={actionButton} onClick={() => setStartPanelView(true)}>
              <Icon iconName={'ProductList'} styles={botRuntimeStartIcon} />
            </ActionButton>
          </div>
        )}

        {showUpdateAvailableIcon && (
          <IconButton
            iconProps={{ iconName: 'History' }}
            styles={updateAvailableIcon as IButtonStyles}
            title={formatMessage('Update available')}
            onClick={onUpdateAvailableClick}
          />
        )}
      </div>

      {showStartBotsPanel && <StartBotsPanel isOpen={showStartBotsPanel} onDismiss={dismissStartPanelViewer} />}
    </div>
  );
};
//?Start Bots
