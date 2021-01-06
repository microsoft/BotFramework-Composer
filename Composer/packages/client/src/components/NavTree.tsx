// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { DefaultButton, CommandBarButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';

import { navigateTo } from '../utils/navigation';
import { colors } from '../constants';

// -------------------- Styles -------------------- //

const root = css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  .ms-List-cell {
    min-height: 36px;
  }
  .ProjectTreeItem {
    display: flex;
    .ms-Icon {
      color: ${colors.blue10};
    }
    &:hover .ms-Button {
      background: ${colors.gray20};
      .ms-Icon {
        visibility: inherit;
      }
    }
  }
`;

const itemBase: IButtonStyles = {
  root: {
    background: colors.white,
    fontWeight: FontWeights.semilight,
    height: '32px',
    width: '100%',
    fontSize: FontSizes.small,
    paddingLeft: '16px',
    paddingRight: 0,
    border: 0,
    textAlign: 'left',
    marginLeft: 0,
    marginRight: 0,
  },
};

const itemNotSelected: IButtonStyles = mergeStyleSets(itemBase, {
  root: {
    background: colors.white,
    fontWeight: FontWeights.semilight,
  },
});

const itemSelected: IButtonStyles = mergeStyleSets(itemBase, {
  root: {
    background: colors.gray20,
    fontWeight: FontWeights.semibold,
  },
});

// -------------------- NavTree -------------------- //

export interface INavTreeItem {
  id: string;
  name: string;
  ariaLabel?: string;
  url: string;
  menuItems?: IContextualMenuItem[];
  menuIconProps?: IIconProps;
  disabled?: boolean;
}

interface INavTreeProps {
  navLinks: INavTreeItem[];
  regionName: string;
}

const NavTree: React.FC<INavTreeProps> = (props) => {
  const { navLinks, regionName } = props;

  const onRenderOverflowButton = (isSelected: boolean, item) => (
    menuItems: IOverflowSetItemProps[] | undefined
  ): JSX.Element => {
    const buttonStyles: Partial<IButtonStyles> = {
      root: {
        minWidth: 0,
        padding: '0 4px',
        alignSelf: 'stretch',
        height: 'auto',
        background: isSelected ? colors.gray20 : colors.white,
        selectors: {
          '.ms-Icon': {
            visibility: isSelected ? 'inherit' : 'hidden',
          },
        },
      },
    };
    return (
      <CommandBarButton
        ariaLabel={formatMessage('Menu items')}
        menuIconProps={item.menuIconProps as IIconProps}
        menuProps={{ items: menuItems as IContextualMenuItem[] }}
        role="menuitem"
        styles={buttonStyles}
      />
    );
  };

  return (
    <div aria-label={regionName} className="ProjectTree" css={root} data-testid="ProjectTree" role="region">
      {navLinks.map((item) => {
        const isSelected = location.pathname.includes(item.url);

        return (
          <div key={item.id} className="ProjectTreeItem">
            <DefaultButton
              key={item.id}
              disabled={item.disabled}
              href={item.url}
              styles={isSelected ? itemSelected : itemNotSelected}
              text={item.name}
              onClick={(e) => {
                e.preventDefault();
                navigateTo(item.url);
              }}
            />
            {item.menuItems && !item.disabled && (
              <OverflowSet
                key={item.id + 'menu'}
                items={[]}
                overflowItems={item.menuItems as IOverflowSetItemProps[]}
                role="menubar"
                onRenderItem={() => undefined}
                onRenderOverflowButton={onRenderOverflowButton(isSelected, item)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export { NavTree };
