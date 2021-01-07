// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';

import { colors } from '../../colors';

import { moreButton, overflowSet } from './treeItem';

const headerText = css`
  text-align: left;
  text-transform: uppercase;
  font-size: ${FontSizes.size12};
  position: relative;
  display: flex;
  margin: 0;
  padding: 0 0 0 12px;
`;

const headerWrapper = css`
  background: ${colors.gray(60)};
`;

export interface ProjectTreeHeaderMenuItem {
  icon?: string;
  label: string;
  onClick: () => void;
}

export interface ProjectTreeHeaderProps {
  menu: ProjectTreeHeaderMenuItem[];
}

export const ProjectTreeHeader: React.FC<ProjectTreeHeaderProps> = ({ menu }) => {
  const overflowMenu = menu.map((item) => {
    return {
      key: item.label,
      ariaLabel: item.label,
      text: item.label,
      style: { fontSize: FontSizes.size12 },
      iconProps: {
        iconName: item.icon,
        styles: { root: { fontSize: FontSizes.size12, display: item.icon ? 'inherit' : 'none' } },
      },
      onClick: item.onClick,
    };
  });

  const onRenderOverflowButton = (isActive: boolean) => {
    const moreLabel = formatMessage('Actions');
    return (overflowItems: IContextualMenuItem[] | undefined) => {
      if (overflowItems == null) return null;
      return (
        <TooltipHost content={moreLabel} directionalHint={DirectionalHint.rightCenter}>
          <IconButton
            ariaLabel={moreLabel}
            className="project-tree-header-more-btn"
            data-is-focusable={isActive}
            data-testid="projectTreeHeaderMoreButton"
            menuIconProps={{ iconName: 'Add', style: { color: colors.text } }}
            menuProps={{ items: overflowItems }}
            role="cell"
            styles={{ ...moreButton(true), rootHovered: { background: 'none' } }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
              }
            }}
          />
        </TooltipHost>
      );
    };
  };

  return (
    <div css={headerWrapper}>
      <div css={headerText}>
        <OverflowSet
          doNotContainWithinFocusZone
          css={overflowSet(true)}
          data-testid={'ProjectTreeHeaderMoreButton'}
          items={[
            {
              key: 'your project',
              displayName: formatMessage('your project'),
            },
          ]}
          overflowItems={overflowMenu}
          role="row"
          styles={{ item: { flex: 1 } }}
          onRenderItem={(item) => {
            return <div key={item.key}>{item.displayName}</div>;
          }}
          onRenderOverflowButton={onRenderOverflowButton(true)}
        />
      </div>
    </div>
  );
};
