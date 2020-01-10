// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */

import { jsx } from '@emotion/core';
import React, { Fragment } from 'react';

import { dialogItem } from '../../pages/language-understanding/styles';

interface NavLinksProps {
  navLinks: any[];
  fileId: string;
  onSelect: (dialogId: string) => void;
}

export const NavLinks: React.FC<NavLinksProps> = props => {
  const { navLinks, fileId, onSelect } = props;

  return (
    <Fragment>
      {navLinks.map(dialog => {
        return (
          <div
            css={dialogItem(fileId === dialog.id)}
            key={dialog.id}
            onClick={() => {
              onSelect(dialog.id);
            }}
          >
            {dialog.name}
          </div>
        );
      })}
    </Fragment>
  );
};
