// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useContext, useState } from 'react';
import { Link } from '@reach/router';
import { PropTypes } from 'prop-types';
import { CommandBarButton, FocusZone } from 'office-ui-fabric-react';

import { StoreContext } from '../../store';

import { link, outer, commandBarButton } from './styles';

export const NavItem = props => {
  const {
    actions: { onboardingAddCoachMarkRef },
  } = useContext(StoreContext);

  const { to, exact, iconName, labelName, targetUrl, underTest } = props;
  const [active, setActive] = useState(false);

  const addRef = useCallback(ref => onboardingAddCoachMarkRef({ [`nav${labelName.replace(' ', '')}`]: ref }), []);

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
        data-testid={'LeftNav-CommandBarButton' + labelName}
        disabled={underTest}
        aria-disabled={underTest}
        aria-label={labelName}
        ref={addRef}
      >
        <div css={outer} aria-hidden="true">
          <CommandBarButton
            iconProps={{
              iconName,
            }}
            text={labelName}
            styles={commandBarButton(active)}
            disabled={underTest}
            ariaHidden
          />
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
