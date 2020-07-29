// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { useState } from 'react';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';

import { resolveToBasePath } from '../../utils/fileUtil';
import { BASEPATH } from '../../constants';
import { NavItem } from '../NavItem';

import { useLinks } from './../../utils/hooks';

// -------------------- Styles -------------------- //

const globalNav = css`
  height: 44px;
  width: 48px;
  text-align: center;
  line-height: 44px;
  cursor: pointer;
  font-size: ${FontSizes.size16};
  color: #106ebe;
  &:hover {
    background: ${NeutralColors.gray50};
  }
`;

const sideBar = (isExpand: boolean) => css`
  width: ${isExpand ? '175' : '48'}px;
  background-color: ${NeutralColors.gray20};
  height: 100%;
  border-right: 1px solid ${NeutralColors.gray50};
  transition: width 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  flex-shrink: 0;
`;

const dividerTop = css`
  width: 100%;
  border-bottom: 1px solid ${NeutralColors.gray40};
  margin: 0 auto;
`;

const leftNavBottom = () => css`
  height: 90px;
`;

const divider = (isExpand: boolean) => css`
  width: ${isExpand ? '85%' : '40%'};
  border-bottom: 1px solid ${NeutralColors.gray40};
  margin: 0 auto;
`;

// -------------------- SideBar -------------------- //

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
