/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ActionButton, PrimaryButton, Icon, TooltipHost } from 'office-ui-fabric-react';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';

import { headerMain, headerSub, aside, bot, botButton, actionButton, warningIcon, warningContiner } from './styles';
import { OpenStatus } from './../../constants';

export const Header = () => {
  return (
    <header>
      <div css={headerMain}>
        <div css={aside}>{formatMessage('Bot Framework Designer')}</div>
      </div>
      <div css={headerSub}>
        <div css={actionButton}>
          <ActionButton
            css={actionButton}
            iconProps={{
              iconName: 'CirclePlus',
            }}
            onClick={() => openStorageExplorer(OpenStatus.NEW)}
          >
            {formatMessage('New')}
          </ActionButton>
          <ActionButton
            css={actionButton}
            iconProps={{
              iconName: 'OpenFolderHorizontal',
            }}
            onClick={() => openStorageExplorer(OpenStatus.OPEN)}
          >
            {formatMessage('Open')}
          </ActionButton>
          <ActionButton
            css={actionButton}
            iconProps={{
              iconName: 'Save',
            }}
            onClick={() => openStorageExplorer(OpenStatus.SAVEAS)}
          >
            {formatMessage('Save as')}
          </ActionButton>
        </div>
        <div css={bot}>
          {connected && (
            <div css={warningContiner}>
              {botLoadErrorMsg !== '' && (
                <TooltipHost
                  content={formatMessage(botLoadErrorMsg)}
                  calloutProps={{
                    gapSpace: 0,
                  }}
                >
                  <Icon iconName="warning" css={warningIcon} />
                </TooltipHost>
              )}
              <ActionButton
                iconProps={{
                  iconName: 'OpenInNewTab',
                }}
                onClick={() => openInEmulator('http://localhost:3979/api/messages')}
              >
                {formatMessage('Test in Emulator')}
              </ActionButton>
            </div>
          )}
          <PrimaryButton
            css={botButton}
            text={connected ? formatMessage('Reload') : formatMessage('Connect')}
            onClick={() => (connected ? reloadBot() : connectBot())}
          />
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  botStatus: PropTypes.string,
  botLoadErrorMsg: PropTypes.string,
  connectBot: PropTypes.func,
  reloadBot: PropTypes.func,
  openStorageExplorer: PropTypes.func,
};
