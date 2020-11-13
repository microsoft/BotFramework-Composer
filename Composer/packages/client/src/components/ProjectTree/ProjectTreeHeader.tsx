// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FontSizes, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';

import { moreButton, menuStyle, overflowSet } from './treeItem';

const headerText = css`
  text-align: left;
  margin: 0;
  padding: 6px 0 6px 12px;
  text-transform: uppercase;
  font-size: ${FontSizes.size12};
  position: relative;
  display: flex;
`;

const headerWrapper = css`
  background: ${NeutralColors.gray60};
`;

export interface ProjectTreeHeaderProps {
  menu: { icon?: string; label: string; onClick: () => void }[];
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
            menuIconProps={{ iconName: 'Add' }}
            menuProps={{ items: overflowItems, styles: menuStyle }}
            role="cell"
            styles={moreButton(true)}
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
      <p css={headerText}>
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
      </p>
    </div>
  );
};
