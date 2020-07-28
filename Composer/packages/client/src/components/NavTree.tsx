// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Resizable, ResizeCallback } from 're-resizable';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { useRecoilValue } from 'recoil';

import { navigateTo } from '../utils/navigation';
import { dispatcherState, userSettingsState } from '../recoilModel';

// -------------------- Styles -------------------- //

const root = css`
  width: 100%;
  height: 100%;
  border-right: 1px solid #c4c4c4;
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
  const { updateUserSettings } = useRecoilValue(dispatcherState);
  const { dialogNavWidth: currentWidth } = useRecoilValue(userSettingsState);

  const handleResize: ResizeCallback = (_e, _dir, _ref, d) => {
    updateUserSettings({ dialogNavWidth: currentWidth + d.width });
  };

  return (
    <Resizable
      enable={{
        right: true,
      }}
      maxWidth={500}
      minWidth={180}
      size={{ width: currentWidth, height: 'auto' }}
      onResizeStop={handleResize}
    >
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
    </Resizable>
  );
};

export { NavTree };
