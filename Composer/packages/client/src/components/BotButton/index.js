/** @jsx jsx **/
import { jsx } from '@emotion/core';
import { Icon } from 'office-ui-fabric-react';
import { PropTypes } from 'prop-types';

import { botButton } from './styles';

export const BotButton = props => {
  const { style } = props;
  return (
    <div css={botButton} style={style ? style : null}>
      <Icon iconName="Robot" />
    </div>
  );
};

BotButton.propTypes = {
  style: PropTypes.object,
};
