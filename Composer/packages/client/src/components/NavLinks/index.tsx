// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { jsx } from '@emotion/core';
import React, { Fragment } from 'react';

import { dialogItem } from '../../pages/language-understanding/styles';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
interface NavLinksProps {
  navLinks: any[];
  fileId: string;
  onSelect: (dialogId: string) => void;
}

export const NavLinks: React.FC<NavLinksProps> = props => {
  const { navLinks, fileId, onSelect } = props;

  return (
    <Fragment>
      {navLinks.map((dialog, index) => {
        return (
          <DefaultButton
            key={dialog.id}
            onClick={() => {
              onSelect(dialog.id);
            }}
            styles={dialogItem(fileId === dialog.id)}
            text={dialog.name}
            ariaLabel={dialog.id + 'language understanding file'}
            ariaHidden={false}
          />
        );
      })}
    </Fragment>
  );
};
