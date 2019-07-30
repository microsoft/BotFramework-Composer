/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState } from 'react';
import { IconButton } from 'office-ui-fabric-react';

import {
  collapseContainer,
  collapseHeader,
  headerText,
  headerIcon,
  headerButton,
  collapseContent,
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
        <IconButton onClick={collapseFuc} iconProps={{ iconName: 'PageRight' }} css={headerButton(collapsed)} />
      </div>
      <div className="collapse__content" css={collapseContent(collapsed)}>
        {children}
      </div>
    </div>
  );
};
