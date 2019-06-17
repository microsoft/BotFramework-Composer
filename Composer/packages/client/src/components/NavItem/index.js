/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Link } from '@reach/router';
import { PropTypes } from 'prop-types';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { Fragment, useState } from 'react';

import { link, outer, iconButton, commandBarButton, lockedBar } from './styles';

export const NavItem = props => {
  const { to, exact, labelHide, iconName, labelName, targetUrl, index } = props;
  const [active, setActive] = useState(false);

  const isPartial = (targetUrl, currentUrl) => {
    const urlPaths = currentUrl.split('/');
    return urlPaths.indexOf(targetUrl) !== -1;
  };

  return (
    <Link
      to={to}
      tabIndex={-1}
      style={link}
      getProps={({ isCurrent, location }) => {
        const isActive = exact ? isCurrent : isPartial(targetUrl, location.pathname);
        setActive(isActive);
      }}
    >
      <div tabIndex={-1} css={outer(!labelHide, active)}>
        {labelHide ? (
          <Fragment>
            {active && <div css={lockedBar} />}
            <IconButton iconProps={{ iconName }} styles={iconButton} />
          </Fragment>
        ) : (
          <Fragment>
            {active && <div css={lockedBar} />}
            <CommandBarButton
              iconProps={{ iconName }}
              text={labelName}
              styles={commandBarButton(active)}
              data-testid={'LeftNav-CommandBarButton' + index}
            />
          </Fragment>
        )}
      </div>
    </Link>
  );
};

NavItem.propTypes = {
  to: PropTypes.string,
  iconName: PropTypes.string,
  labelName: PropTypes.string,
  exact: PropTypes.bool,
  labelHide: PropTypes.bool,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  index: PropTypes.number,
  targetUrl: PropTypes.string,
};
