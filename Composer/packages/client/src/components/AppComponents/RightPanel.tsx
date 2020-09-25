// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { forwardRef } from 'react';

import { RequireAuth } from '../RequireAuth';
import { ErrorBoundary } from '../ErrorBoundary';
import { Conversation } from '../Conversation';
import { ProjectTree } from '../ProjectTree/ProjectTree';

import Routes from './../../router';
import { applicationErrorState, dispatcherState, currentProjectIdState, currentModeState } from './../../recoilModel';

// -------------------- Styles -------------------- //

const rightPanel = css`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const content = css`
  outline: none;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;

  label: Content;
`;

const Content = forwardRef<HTMLDivElement>((props, ref) => <div css={content} {...props} ref={ref} />);

const SHOW_TREE = ['design'];

export const RightPanel = () => {
  const applicationError = useRecoilValue(applicationErrorState);
  const { setApplicationLevelError, fetchProjectById } = useRecoilValue(dispatcherState);
  const projectId = useRecoilValue(currentProjectIdState);
  const currentMode = useRecoilValue(currentModeState);

  console.log(currentMode);

  return (
    <div css={rightPanel}>
      <ErrorBoundary
        currentApplicationError={applicationError}
        fetchProject={() => fetchProjectById(projectId)}
        setApplicationLevelError={setApplicationLevelError}
      >
        <RequireAuth>
          <div css={{ display: 'flex', flexDirection: 'row' }}>
            {SHOW_TREE.includes(currentMode) && (
              <ProjectTree
                selected={'testg'}
                selectedDialog={'test'}
                showTriggers={currentMode === 'design'}
                onDelete={(link) => {
                  console.log(link);
                }}
                onSelect={(link) => {
                  console.log(link);
                }}
              />
            )}
            <Conversation>
              <Routes component={Content} />
            </Conversation>
          </div>
        </RequireAuth>
      </ErrorBoundary>
    </div>
  );
};
