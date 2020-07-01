// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

import { ToolBar, IToolBarItem } from '../ToolBar/ToolBar';
import { NavTree, INavTreeItem } from '../NavTree/NavTree';

import * as styles from './styles';

interface IPageProps {
  // TODO: add type
  toolbarItems: IToolBarItem[];
  navLinks: INavTreeItem[];
  title: string;
  navRegionName: string;
  mainRegionName: string;
  onRenderHeaderContent?: () => string | JSX.Element | null;
  'data-testid'?: string;
}

const Page: React.FC<IPageProps> = (props) => {
  const { title, navLinks, toolbarItems, onRenderHeaderContent, children, navRegionName, mainRegionName } = props;

  return (
    <div css={styles.root} data-testid={props['data-testid']}>
      <div css={styles.pageWrapper}>
        <ToolBar toolbarItems={toolbarItems} />
        <div css={styles.header}>
          <h1 css={styles.headerTitle}>{title}</h1>
          {onRenderHeaderContent && <div css={styles.headerContent}>{onRenderHeaderContent()}</div>}
        </div>
        <div css={styles.main} role="main">
          <NavTree navLinks={navLinks} regionName={navRegionName} />
          <div aria-label={mainRegionName} css={styles.content} data-testid="PageContent" role="region">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Page };
