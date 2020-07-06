// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback, useContext } from 'react';
import { Link } from '@reach/router';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';

import { StoreContext } from '../../store';
import { useLocation, useRouterCache } from '../../utils/hooks';

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
  showTooltip: boolean;
}

export const NavItem: React.FC<INavItemProps> = (props) => {
  const {
    actions: { onboardingAddCoachMarkRef },
  } = useContext(StoreContext);

  const { to, iconName, labelName, disabled, showTooltip } = props;
  const {
    location: { pathname },
  } = useLocation();

  const linkTo = useRouterCache(to);

  const active = pathname.startsWith(to);

  const addRef = useCallback((ref) => onboardingAddCoachMarkRef({ [`nav${labelName.replace(' ', '')}`]: ref }), []);

  const iconElement = <Icon iconName={iconName} styles={icon(active, disabled)} />;

  const activeArea = (
    <div
      aria-disabled={disabled}
      aria-hidden="true"
      css={link(active, disabled)}
      data-testid={active ? 'ActiveLeftNavItem' : undefined}
      tabIndex={-1}
    >
      {showTooltip ? (
        <TooltipHost content={labelName} directionalHint={DirectionalHint.rightCenter}>
          {iconElement}
        </TooltipHost>
      ) : (
        iconElement
      )}
      {labelName}
    </div>
  );

  if (disabled) {
    // make it so we can't even click them by accident and lead to the error page
    return activeArea;
  }

  return (
    <Link
      ref={addRef}
      aria-disabled={disabled}
      aria-label={labelName + (active ? '; selected' : '')}
      css={css`
        display: block;

        :link {
          text-decoration: none;
        }
        :visited {
          text-decoration: none;
        }

        :focus {
          outline: none;
          position: relative;

          &::after {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            border: 1px solid black;
          }
        }
      `}
      data-testid={'LeftNav-CommandBarButton' + labelName}
      to={linkTo}
    >
      {activeArea}
    </Link>
  );
};
