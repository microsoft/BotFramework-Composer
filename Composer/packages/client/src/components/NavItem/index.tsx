// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback, useContext } from 'react';
import { Link } from '@reach/router';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { StoreContext } from '../../store';
import { useLocation } from '../../utils/hooks';

import { link, icon } from './styles';

/**
 * @param to The string URI to link to. Supports relative and absolute URIs.
 * @param exact The uri is exactly the same as the anchor’s href.
 * @param iconName The link's icon.
 * @param labelName The link's text.
 * @param disabled If true, the Link will be unavailable.
 */
export interface INavItemProps {
  to: string;
  exact: boolean;
  iconName: string;
  labelName: string;
  disabled: boolean;
}

export const NavItem: React.FC<INavItemProps> = props => {
  const {
    actions: { onboardingAddCoachMarkRef },
  } = useContext(StoreContext);

  const { to, iconName, labelName, disabled } = props;
  const {
    location: { pathname },
  } = useLocation();
  const active = pathname.startsWith(to);

  const addRef = useCallback(ref => onboardingAddCoachMarkRef({ [`nav${labelName.replace(' ', '')}`]: ref }), []);

  const activeArea = (
    <div
      css={link(active, disabled)}
      aria-hidden="true"
      tabIndex={-1}
      aria-disabled={disabled}
    >
      <Icon data-testid={'LeftNav-CommandBarButton' + labelName} iconName={iconName} styles={icon(active, disabled)} />
      {labelName}
    </div>
  );

  if (disabled) {
    // make it so we can't even click them by accident and lead to the error page
    return activeArea;
  }

  return (
    <Link
      to={to}
      aria-disabled={disabled}
      aria-label={labelName + (active ? '; selected' : '')}
      ref={addRef}
      css={css`
        :link {
          text-decoration: none;
        }
        :visited {
          text-decoration: none;
        }
      `}
    >
      {activeArea}
    </Link>
  );
};
