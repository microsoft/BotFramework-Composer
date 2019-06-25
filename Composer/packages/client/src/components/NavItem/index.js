/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Link } from '@reach/router';
import { PropTypes } from 'prop-types';
import { IconButton, CommandBarButton, FocusZone } from 'office-ui-fabric-react';
import { useState } from 'react';
import formatMessage from 'format-message';

import { link, outer, iconButton, commandBarButton } from './styles';

export const NavItem = props => {
  const { to, exact, labelHide, iconName, labelName, targetUrl, underTest } = props;
  const [active, setActive] = useState(false);

  const isPartial = (targetUrl, currentUrl) => {
    const urlPaths = currentUrl.split('/');
    return urlPaths.indexOf(targetUrl) !== -1;
  };

  return (
    <FocusZone allowFocusRoot={true} disabled={underTest}>
      <Link
        to={to}
        css={link(active, underTest)}
        getProps={({ isCurrent, location }) => {
          const isActive = exact ? isCurrent : isPartial(targetUrl, location.pathname);
          setActive(isActive);
        }}
        aria-pressed="false"
        aria-hidden="true"
        aria-disable="true"
        data-testid={'LeftNav-CommandBarButton' + labelName}
      >
        <div css={outer(!labelHide, active)}>
          {labelHide ? (
            <IconButton
              iconProps={{
                iconName,
              }}
              ariaLabel={labelName}
              styles={iconButton}
              disabled={underTest}
            />
          ) : (
            <CommandBarButton
              iconProps={{
                iconName,
              }}
              ariaHidden={underTest}
              text={formatMessage(labelName)}
              styles={commandBarButton}
              disabled={underTest}
            />
          )}
        </div>
      </Link>
    </FocusZone>
  );
};
NavItem.propTypes = {
  to: PropTypes.string,
  iconName: PropTypes.string,
  labelName: PropTypes.string,
  exact: PropTypes.bool,
  labelHide: PropTypes.bool,
  index: PropTypes.number,
  targetUrl: PropTypes.string,
};
