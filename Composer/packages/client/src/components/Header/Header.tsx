// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { IconButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { useCallback, Fragment } from 'react';
import { useRecoilValue } from 'recoil';

import composerIcon from '../../images/composerIcon.svg';
import { AppUpdaterStatus } from '../../constants';
import { dispatcherState, appUpdateState, botNameState, localeState } from '../../recoilModel';

import { updateAvailableIcon, headerContainer, title, botName, divider, headerTextContainer } from './styles';

export const Header = () => {
  const { setAppUpdateShowing } = useRecoilValue(dispatcherState);
  const curBotName = useRecoilValue(botNameState);
  const locale = useRecoilValue(localeState);
  const appUpdate = useRecoilValue(appUpdateState);
  const { showing, status } = appUpdate;

  const onUpdateAvailableClick = useCallback(() => {
    setAppUpdateShowing(true);
  }, []);

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
        {curBotName && (
          <Fragment>
            <div css={divider} />
            <span css={botName}>{`${curBotName} (${locale})`}</span>
          </Fragment>
        )}
      </div>
      {showUpdateAvailableIcon && (
        <IconButton
          iconProps={{ iconName: 'History' }}
          styles={updateAvailableIcon as IButtonStyles}
          title={formatMessage('Update available')}
          onClick={onUpdateAvailableClick}
        />
      )}
    </div>
  );
};
