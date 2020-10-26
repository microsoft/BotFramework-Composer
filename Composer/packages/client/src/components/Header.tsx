// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { IconButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { useCallback, Fragment } from 'react';
import { useRecoilValue } from 'recoil';
import { SharedColors } from '@uifabric/fluent-theme';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';

import {
  dispatcherState,
  appUpdateState,
  botDisplayNameState,
  localeState,
  currentProjectIdState,
} from '../recoilModel';
import composerIcon from '../images/composerIcon.svg';
import { AppUpdaterStatus } from '../constants';

import { NotificationButton } from './Notifications/NotificationButton';

// -------------------- Styles -------------------- //

const headerContainer = css`
  background: ${SharedColors.cyanBlue10};
  height: 50px;
  display: flex;
  justify-content: space-between;
  padding-right: 20px;
  margin: auto;
`;

const logo = css`
  display: flex;
`;

const title = css`
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

const controls = css`
  display: flex;
  align-items: center;
`;

const buttonStyles: IButtonStyles = {
  icon: {
    color: '#FFF',
    fontSize: '20px',
  },
  root: {
    height: '20px',
    width: '20px',
    marginLeft: '16px',
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
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  margin-left: 20px;
`;

// -------------------- Header -------------------- //

export const Header = () => {
  const { setAppUpdateShowing } = useRecoilValue(dispatcherState);
  const projectId = useRecoilValue(currentProjectIdState);
  const projectName = useRecoilValue(botDisplayNameState(projectId));
  const locale = useRecoilValue(localeState(projectId));
  const appUpdate = useRecoilValue(appUpdateState);
  const { showing, status } = appUpdate;

  const onUpdateAvailableClick = useCallback(() => {
    setAppUpdateShowing(true);
  }, []);

  const showUpdateAvailableIcon = status === AppUpdaterStatus.UPDATE_AVAILABLE && !showing;

  return (
    <div css={headerContainer} role="banner">
      <div css={logo}>
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
      </div>
      <div css={controls}>
        {showUpdateAvailableIcon && (
          <IconButton
            iconProps={{ iconName: 'History' }}
            styles={buttonStyles}
            title={formatMessage('Update available')}
            onClick={onUpdateAvailableClick}
          />
        )}
        <NotificationButton buttonStyles={buttonStyles} />
      </div>
    </div>
  );
};
