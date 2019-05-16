/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ActionButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';

import { header, aside, bot, botButton, actionButton } from './styles';
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
  const { botStatus, setBotStatus, openStorageExplorer } = props;
  return (
    <header css={header}>
      <div css={aside}>Composer</div>
      <div css={actionButton}>
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'CirclePlus', iconColor: '#ffffff' }}
          onClick={() => openStorageExplorer(OpenStatus.NEW)}
        >
          New
        </ActionButton>
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'OpenFolderHorizontal', iconColor: '#ffffff' }}
          onClick={() => openStorageExplorer(OpenStatus.OPEN)}
        >
          Open
        </ActionButton>
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'Save', iconColor: '#ffffff' }}
          onClick={() => openStorageExplorer(OpenStatus.SAVEAS)}
        >
          Save as
        </ActionButton>
      </div>
      <div css={bot}>
        {botStatus === 'running' && (
          <ActionButton
            iconProps={{ iconName: 'OpenInNewTab', iconColor: '#ffffff' }}
            css={actionButton}
            style={{ marginTop: '3px' }}
            text={formatMessage('Connect and Test')}
            onClick={() => openInEmulator('http://localhost:3979/api/messages')}
          />
        )}
        <PrimaryButton
          css={botButton}
          text={botStatus === 'running' ? formatMessage('Stop') : formatMessage('Start')}
          onClick={() => setBotStatus(botStatus)}
        />
      </div>
    </header>
  );
};

Header.propTypes = {
  botStatus: PropTypes.string,
  setBotStatus: PropTypes.func,
  openStorageExplorer: PropTypes.func,
};
