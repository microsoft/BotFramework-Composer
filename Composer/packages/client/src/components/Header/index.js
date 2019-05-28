/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ActionButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';

import { headerMain, headerSub, aside, bot, botButton, actionButton } from './styles';
import { OpenStatus } from './../../constants';

const openInEmulator = url => {
  // this creates a temporary hidden iframe to fire off the bfemulator protocol
  // and start up the emulator
  const i = document.createElement('iframe');
  i.style.display = 'none';
  i.onload = () => i.parentNode.removeChild(i);
  i.src = `bfemulator://livechat.open?botUrl=${encodeURIComponent(url)}`;
  document.body.appendChild(i);
};

export const Header = props => {
  const { botStatus, connectBot, reloadBot, openStorageExplorer } = props;
  const connected = botStatus === 'connected';
  return (
    <header>
      <div css={headerMain}>
        <div css={aside}>{formatMessage('Bot Framework Designer')}</div>
      </div>
      <div css={headerSub}>
        <div css={actionButton}>
          <ActionButton
            css={actionButton}
            iconProps={{ iconName: 'CirclePlus' }}
            onClick={() => openStorageExplorer(OpenStatus.NEW)}
          >
            {formatMessage('New')}
          </ActionButton>
          <ActionButton
            css={actionButton}
            iconProps={{ iconName: 'OpenFolderHorizontal' }}
            onClick={() => openStorageExplorer(OpenStatus.OPEN)}
          >
            {formatMessage('Open')}
          </ActionButton>
          <ActionButton
            css={actionButton}
            iconProps={{ iconName: 'Save' }}
            onClick={() => openStorageExplorer(OpenStatus.SAVEAS)}
          >
            {formatMessage('Save as')}
          </ActionButton>
        </div>
        <div css={bot}>
          {connected && (
            <ActionButton
              iconProps={{ iconName: 'OpenInNewTab' }}
              css={actionButton}
              style={{ marginTop: '3px' }}
              onClick={() => openInEmulator('http://localhost:3979/api/messages')}
            >
              {formatMessage('Test in Emulator')}
            </ActionButton>
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
  connectBot: PropTypes.func,
  reloadBot: PropTypes.func,
  openStorageExplorer: PropTypes.func,
};
