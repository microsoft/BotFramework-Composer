// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import { Resizable, ResizeCallback } from 're-resizable';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { StoreContext } from '../../store';

import { root, itemNotSelected, itemSelected } from './styles';

interface INavTreeProps {
  navLinks: any[];
  selectedItem: string;
  onSelect: (id: string, selected?: string) => void;
}

const NavTree: React.FC<INavTreeProps> = props => {
  const { navLinks, onSelect, selectedItem } = props;
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
      size={{ width: currentWidth, height: 'auto' }}
      minWidth={180}
      maxWidth={500}
      enable={{
        right: true,
      }}
      onResizeStop={handleResize}
    >
      <div className="ProjectTree" css={root} data-testid="ProjectTree">
        {navLinks.map(item => {
          return (
            <DefaultButton
              key={item.id}
              onClick={() => {
                onSelect(item.id);
              }}
              styles={selectedItem === item.id ? itemSelected : itemNotSelected}
              text={item.name}
              ariaLabel={item.ariaLabel}
              ariaHidden={false}
            />
          );
        })}
      </div>
    </Resizable>
  );
};

export { NavTree };
