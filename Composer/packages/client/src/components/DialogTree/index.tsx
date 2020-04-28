// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';
import { Resizable, ResizeCallback } from 're-resizable';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { StoreContext } from '../../store';

import { root, dialogItemNotSelected, dialogItemSelected } from './styles';

interface IDialogTreeProps {
  navLinks: any[];
  dialogId: string;
  onSelect: (id: string, selected?: string) => void;
}

export const DialogTree: React.FC<IDialogTreeProps> = props => {
  const { navLinks, onSelect, dialogId } = props;
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
              styles={dialogId === item.id ? dialogItemSelected : dialogItemNotSelected}
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
