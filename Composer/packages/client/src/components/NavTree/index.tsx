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
}

interface INavTreeProps {
  navLinks: INavTreeItem[];
}

const NavTree: React.FC<INavTreeProps> = (props) => {
  const { navLinks } = props;
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
      onResizeStop={handleResize}
      size={{ width: currentWidth, height: 'auto' }}
    >
      <div className="ProjectTree" css={root} data-testid="ProjectTree">
        {navLinks.map((item) => {
          const isSelected = location.pathname.includes(item.url);

          return (
            <DefaultButton
              href={item.url}
              key={item.id}
              onClick={(e) => {
                e.preventDefault();
                navigateTo(item.url);
              }}
              styles={isSelected ? itemSelected : itemNotSelected}
              text={item.name}
            />
          );
        })}
      </div>
    </Resizable>
  );
};

export { NavTree };
