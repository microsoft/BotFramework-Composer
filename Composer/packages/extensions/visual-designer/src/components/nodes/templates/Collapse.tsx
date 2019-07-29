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
    <div css={collapseContainer}>
      <div css={collapseHeader}>
        <div css={headerText}>{text}</div>
        <div css={headerIcon} />
        <IconButton onClick={collapseFuc} iconProps={{ iconName: 'PageRight' }} css={headerButton(collapsed)} />
      </div>
      <div css={collapseContent(collapsed)}>{children}</div>
    </div>
  );
};
