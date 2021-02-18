// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css, SerializedStyles } from '@emotion/core';
import React from 'react';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { Toolbar, IToolbarItem } from '@bfc/ui-shared';
import { useRecoilValue } from 'recoil';
import { Split, SplitMeasuredSizes } from '@geoffcox/react-splitter';

import { navigateTo, buildURL } from '../utils/navigation';
import { dispatcherState, PageMode } from '../recoilModel';
import { DebugPanel } from '../pages/design/DebugPanel/DebugPanel';

import { NavTree, INavTreeItem } from './NavTree';
import { ProjectTree } from './ProjectTree/ProjectTree';
import { renderThinSplitter } from './Split/ThinSplitter';

// -------------------- Styles -------------------- //

export const root = css`
  height: calc(100vh - 50px);
  display: flex;
  flex-direction: row;

  label: Page;
`;

export const pageWrapper = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  label: PageWrapper;
`;

export const header = css`
  padding: 5px 20px;
  height: 60px;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  align-items: center;

  label: PageHeader;
`;

export const headerTitle = css`
  font-size: ${FontSizes.xLarge};
  font-weight: ${FontWeights.semibold};

  label: PageHeaderTitle;
`;

export const headerContent = css`
  display: flex;
  align-items: center;
  font-size: ${FontSizes.smallPlus};
  label: PageHeaderContent;
`;

export const main = css`
  margin-left: 2px;
  height: calc(100vh - 165px);
  display: flex;
  flex-grow: 1;
  border-top: 1px solid #dddddd;
  position: relative;
  nav {
    ul {
      margin-top: 0px;
    }
  }

  label: PageMain;
`;

export const content = (shouldShowEditorError: boolean) => css`
  flex: 4;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: auto;
  height: ${shouldShowEditorError ? 'calc(100% - 40px)' : '100%'};
  label: PageContent;
  box-sizing: border-box;
`;

const contentStyle = css`
  padding: 20px;
  flex-grow: 1;
  height: 0;
  position: relative;
`;

// -------------------- Page -------------------- //

type IPageProps = {
  // TODO: add type
  toolbarItems: IToolbarItem[];
  title: string;
  headerStyle?: SerializedStyles;
  navRegionName: string;
  mainRegionName: string;
  shouldShowEditorError?: boolean;
  onRenderHeaderContent?: () => string | JSX.Element | null;
  'data-testid'?: string;
  useNewTree?: boolean;
  navLinks?: INavTreeItem[];
  pageMode: PageMode;
  showCommonLinks?: boolean;
  projectId?: string;
  skillId?: string;
  dialogId?: string;
  fileId?: string;
};

const Page: React.FC<IPageProps> = (props) => {
  const {
    title,
    navLinks,
    toolbarItems,
    onRenderHeaderContent,
    children,
    navRegionName,
    mainRegionName,
    headerStyle = header,
    shouldShowEditorError = false,
    useNewTree,
    pageMode,
    showCommonLinks = false,
    projectId,
    skillId,
    dialogId,
    fileId,
  } = props;

  const { setPageElementState } = useRecoilValue(dispatcherState);

  const onMeasuredSizesChanged = (sizes: SplitMeasuredSizes) => {
    setPageElementState(pageMode, { leftSplitWidth: sizes.primary });
  };

  return (
    <div css={root} data-testid={props['data-testid']}>
      <div css={pageWrapper}>
        <Toolbar toolbarItems={toolbarItems} />
        <div css={headerStyle}>
          <h1 css={headerTitle}>{title}</h1>
          {onRenderHeaderContent && <div css={headerContent}>{onRenderHeaderContent()}</div>}
        </div>
        <div css={main} role="main">
          <Split
            resetOnDoubleClick
            initialPrimarySize="20%"
            minPrimarySize="200px"
            minSecondarySize="800px"
            renderSplitter={renderThinSplitter}
            onMeasuredSizesChanged={onMeasuredSizesChanged}
          >
            {useNewTree ? (
              <ProjectTree
                options={{
                  showDelete: false,
                  showTriggers: false,
                  showDialogs: true,
                  showLgImports: pageMode === 'language-generation',
                  showLuImports: pageMode === 'language-understanding',
                  showRemote: false,
                  showMenu: false,
                  showQnAMenu: title === 'QnA',
                  showErrors: false,
                  showCommonLinks,
                }}
                selectedLink={{
                  projectId,
                  skillId,
                  dialogId,
                  lgFileId: pageMode === 'language-generation' && fileId ? fileId : undefined,
                  luFileId: pageMode === 'language-understanding' && fileId ? fileId : undefined,
                }}
                onSelect={(link) => {
                  navigateTo(buildURL(pageMode, link));
                }}
              />
            ) : (
              <NavTree navLinks={navLinks as INavTreeItem[]} regionName={navRegionName} />
            )}
            <div
              aria-label={mainRegionName}
              css={content(shouldShowEditorError)}
              data-testid="PageContent"
              role="region"
            >
              <div css={contentStyle}>{children}</div>
              <DebugPanel />
            </div>
          </Split>
        </div>
      </div>
    </div>
  );
};

export { Page };
