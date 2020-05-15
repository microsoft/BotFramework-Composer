// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

import { ToolBar } from '../ToolBar';
import { NavTree, INavTreeItem } from '../NavTree';

import * as styles from './styles';

interface IPageProps {
  // TODO: add type
  toolbarItems: any;
  navLinks: INavTreeItem[];
  title: string;
  onRenderHeaderContent?: () => string | JSX.Element | null;
  'data-testid'?: string;
}

const Page: React.FC<IPageProps> = props => {
  const { title, navLinks, toolbarItems, onRenderHeaderContent, children } = props;

  return (
    <div css={styles.root} data-testid={props['data-testid']}>
      <div css={styles.pageWrapper}>
        <ToolBar toolbarItems={toolbarItems} />
        <div css={styles.header}>
          <h1 css={styles.headerTitle}>{title}</h1>
          {onRenderHeaderContent && <div css={styles.headerContent}>{onRenderHeaderContent()}</div>}
        </div>
        <div role="main" css={styles.main}>
          <NavTree navLinks={navLinks} />
          <div css={styles.content} data-testid="PageContent">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Page };
