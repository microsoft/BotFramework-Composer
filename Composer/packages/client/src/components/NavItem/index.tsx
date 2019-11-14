// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback, useContext, useState } from 'react';
import { Link, LinkGetProps } from '@reach/router';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';

import { StoreContext } from '../../store';

import { link, outer, commandBarButton } from './styles';

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

  const { to, exact, iconName, labelName, disabled } = props;
  const [active, setActive] = useState(false);

  const addRef = useCallback(ref => onboardingAddCoachMarkRef({ [`nav${labelName.replace(' ', '')}`]: ref }), []);

  return (
    <FocusZone allowFocusRoot={true} disabled={disabled}>
      <Link
        to={to}
        css={link(active, disabled)}
        getProps={(props: LinkGetProps) => {
          const isActive = exact ? props.isCurrent : props.isPartiallyCurrent;
          setActive(isActive);
          return {};
        }}
        data-testid={'LeftNav-CommandBarButton' + labelName}
        aria-disabled={disabled}
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
            disabled={disabled}
            ariaHidden
          />
        </div>
      </Link>
    </FocusZone>
  );
};
