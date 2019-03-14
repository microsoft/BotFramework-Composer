/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { PropTypes } from 'prop-types';
import { Icon } from 'office-ui-fabric-react';

import httpClient from '../../utils/http';

import { header, waffle, aside, bot, botButton, botMessage } from './styles';

export const Header = props => (
  <header css={header}>
    <div css={waffle}>
      <Icon iconName="WaffleOffice365" />
    </div>
    <div css={aside}>COMPOSER</div>
    <div css={bot}>
      <span css={botMessage}>{props.botStatus === 'running' ? 'Bot is running at http://localhost:3979' : ''}</span>
      <PrimaryButton
        css={botButton}
        text={props.botStatus === 'running' ? 'Stop' : 'Start'}
        onClick={() =>
          props.client.toggleBot(props.botStatus, status => {
            props.setBotStatus(status);
          })
        }
      />
    </div>
  </header>
);

Header.propTypes = {
  botStatus: PropTypes.string,
  client: PropTypes.instanceOf(httpClient),
  setBotStatus: PropTypes.func,
};
