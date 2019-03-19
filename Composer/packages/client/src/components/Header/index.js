/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ActionButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { PropTypes } from 'prop-types';

import { header, aside, bot, botButton, botMessage, actionButton } from './styles';

export const Header = props => {
  const { botStatus, setBotStatus } = props;
  return (
    <header css={header}>
      <div css={aside}>Composer</div>
      <div css={actionButton}>
        <ActionButton css={actionButton} iconProps={{ iconName: 'CirclePlus', iconColor: '#ffffff' }}>
          New
        </ActionButton>
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'OpenFolderHorizontal', iconColor: '#ffffff' }}
          onClick={() => {
            props.setPanelStatus(true);
          }}
        >
          Open
        </ActionButton>
      </div>
      <div css={bot}>
        <span css={botMessage}>{botStatus === 'running' ? 'Bot is running at http://localhost:3979' : ''}</span>
        <PrimaryButton
          css={botButton}
          text={botStatus === 'running' ? 'Stop' : 'Start'}
          onClick={() => setBotStatus(botStatus)}
        />
      </div>
    </header>
  );
};

Header.propTypes = {
  botStatus: PropTypes.string,
  setBotStatus: PropTypes.func,
  setPanelStatus: PropTypes.func,
};
