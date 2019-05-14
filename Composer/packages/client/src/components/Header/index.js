/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ActionButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';

import { header, aside, bot, botButton, botMessage, actionButton } from './styles';
import { OpenStatus } from './../../constants';

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
        <span css={botMessage}>
          {botStatus === 'running' ? formatMessage('Bot is running at http://localhost:3979') : ''}
        </span>
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
