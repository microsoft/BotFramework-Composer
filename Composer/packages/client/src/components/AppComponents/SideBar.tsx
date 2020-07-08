// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';

import { NavItem } from '../NavItem/NavItem';
import { resolveToBasePath } from '../../utils/fileUtil';
import { BASEPATH } from '../../constants';

import { useLinks } from './../../utils/hooks';
import { globalNav, sideBar, dividerTop, leftNavBottom, divider } from './styles';

export const SideBar = () => {
  const [sideBarExpand, setSideBarExpand] = useState(false);
  const { topLinks, bottomLinks } = useLinks();

  const mapNavItemTo = (relPath: string) => resolveToBasePath(BASEPATH, relPath);
  const globalNavButtonText = sideBarExpand ? formatMessage('Collapse Navigation') : formatMessage('Expand Navigation');
  const showTooltips = (link) => !sideBarExpand && !link.disabled;
  return (
    <nav css={sideBar(sideBarExpand)}>
      <div>
        <TooltipHost content={globalNavButtonText} directionalHint={DirectionalHint.rightCenter}>
          <IconButton
            ariaLabel={globalNavButtonText}
            css={globalNav}
            data-testid={'LeftNavButton'}
            iconProps={{
              iconName: 'GlobalNavButton',
            }}
            onClick={() => {
              setSideBarExpand((current) => !current);
            }}
          />
        </TooltipHost>
        <div css={dividerTop} />{' '}
        <FocusZone allowFocusRoot>
          {topLinks.map((link, index) => {
            return (
              <NavItem
                key={'NavLeftBar' + index}
                disabled={link.disabled}
                exact={link.exact}
                iconName={link.iconName}
                labelName={link.labelName}
                showTooltip={showTooltips(link)}
                to={mapNavItemTo(link.to)}
              />
            );
          })}
        </FocusZone>
      </div>
      <div css={leftNavBottom}>
        <div css={divider(sideBarExpand)} />{' '}
        {bottomLinks.map((link, index) => {
          return (
            <NavItem
              key={'NavLeftBar' + index}
              disabled={link.disabled}
              exact={link.exact}
              iconName={link.iconName}
              labelName={link.labelName}
              showTooltip={showTooltips(link)}
              to={mapNavItemTo(link.to)}
            />
          );
        })}
      </div>
    </nav>
  );
};
