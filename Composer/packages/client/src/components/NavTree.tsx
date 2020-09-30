// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';

import { navigateTo } from '../utils/navigation';

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
`;

const itemBase: IButtonStyles = {
  root: {
    background: NeutralColors.white,
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
    background: NeutralColors.white,
    fontWeight: FontWeights.semilight,
  },
});

const itemSelected: IButtonStyles = mergeStyleSets(itemBase, {
  root: {
    background: NeutralColors.gray20,
    fontWeight: FontWeights.semibold,
  },
});

// -------------------- NavTree -------------------- //

export interface INavTreeItem {
  id: string;
  name: string;
  ariaLabel?: string;
  url: string;
  disabled?: boolean;
}

interface INavTreeProps {
  navLinks: INavTreeItem[];
  regionName: string;
}

const NavTree: React.FC<INavTreeProps> = (props) => {
  const { navLinks, regionName } = props;

  return (
    <div aria-label={regionName} className="ProjectTree" css={root} data-testid="ProjectTree" role="region">
      {navLinks.map((item) => {
        const isSelected = location.pathname.includes(item.url);

        return (
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
        );
      })}
    </div>
  );
};

export { NavTree };
