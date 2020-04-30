// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { useContext, useCallback, Fragment } from 'react';

import composerIcon from '../../images/composerIcon.svg';
import { AppUpdaterStatus } from '../../constants';
import { StoreContext } from '../../store';

import { updateAvailableIcon, headerContainer, title, botName, divider, headerTextContainer } from './styles';

export const Header = props => {
  const {
    actions: { setAppUpdateShowing },
    state: { appUpdate },
  } = useContext(StoreContext);
  const { showing, status } = appUpdate;

  const onUpdateAvailableClick = useCallback(() => {
    setAppUpdateShowing(true);
  }, []);

  const showUpdateAvailableIcon = status === AppUpdaterStatus.UPDATE_AVAILABLE && !showing;

  return (
    <div role="banner" css={headerContainer}>
      <img
        style={{ marginLeft: '9px' }}
        alt={formatMessage('Composer Logo')}
        aria-label={formatMessage('Composer Logo')}
        src={composerIcon}
      />
      <div css={headerTextContainer}>
        <div css={title}>{formatMessage('Bot Framework Composer')}</div>
        {props.botName && (
          <Fragment>
            <div css={divider} />
            <span css={botName}>{`${props.botName} (${props.locale})`}</span>
          </Fragment>
        )}
      </div>
      {showUpdateAvailableIcon && (
        <IconButton
          iconProps={{ iconName: 'History' }}
          onClick={onUpdateAvailableClick}
          styles={updateAvailableIcon}
          title={formatMessage('Update available')}
        />
      )}
    </div>
  );
};
