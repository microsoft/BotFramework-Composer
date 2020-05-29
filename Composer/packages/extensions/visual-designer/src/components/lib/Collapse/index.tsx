// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import {
  collapseContainer,
  collapseHeader,
  headerText,
  headerIcon,
  headerButton,
  collapseContent
} from './CollapseStyles';

export const Collapse = ({ text, children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const collapseFuc = e => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };
  return (
    <div className="collapse" css={collapseContainer}>
      <div className="collapse__topbar" css={collapseHeader}>
        <div className="collapse__header" css={headerText}>
          {text}
        </div>
        <div className="collapse__line" css={headerIcon} />
        <IconButton css={headerButton(collapsed)} iconProps={{ iconName: 'PageRight' }} onClick={collapseFuc} />
      </div>
      <div className="collapse__content" css={collapseContent(collapsed)}>
        {children}
      </div>
    </div>
  );
};
