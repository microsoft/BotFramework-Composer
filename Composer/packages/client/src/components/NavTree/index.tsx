// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import { Resizable, ResizeCallback } from 're-resizable';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { StoreContext } from '../../store';
import { navigateTo } from '../../utils';

import { root, itemNotSelected, itemSelected } from './styles';

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
  const {
    actions: { updateUserSettings },
    state: {
      userSettings: { dialogNavWidth: currentWidth },
    },
  } = useContext(StoreContext);

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
