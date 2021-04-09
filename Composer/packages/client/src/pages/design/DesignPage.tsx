// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { RouteComponentProps } from '@reach/router';
import { useRecoilValue } from 'recoil';
import { Split, SplitMeasuredSizes } from '@geoffcox/react-splitter';

import { dispatcherState } from '../../recoilModel';
import { renderThinSplitter } from '../../components/Split/ThinSplitter';
import { Conversation } from '../../components/Conversation';

import SideBar from './SideBar';
import CommandBar from './CommandBar';
import VisualPanel from './VisualPanel';
import PropertyPanel from './PropertyPanel';
import useEmptyPropsHandler from './useEmptyPropsHandler';
import { contentWrapper, editorContainer, editorWrapper } from './styles';
import Modals from './Modals';
import { DebugPanel } from './DebugPanel/DebugPanel';

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

const DesignPage: React.FC<RouteComponentProps<{ dialogId: string; projectId: string; skillId?: string }>> = (
  props
) => {
  const { projectId = '', skillId, location } = props;

  useEmptyPropsHandler(projectId, location, skillId, props.dialogId);
  const { setPageElementState } = useRecoilValue(dispatcherState);

  const onMeasuredSizesChanged = (sizes: SplitMeasuredSizes) => {
    setPageElementState('dialogs', { leftSplitWidth: sizes.primary });
  };

  const activeBot = skillId ?? projectId;

  return (
    <div css={root} data-testid={props['data-testid']}>
      <div css={pageWrapper}>
        <Split
          resetOnDoubleClick
          initialPrimarySize="20%"
          minPrimarySize="200px"
          minSecondarySize="800px"
          renderSplitter={renderThinSplitter}
          splitterSize="5px"
          onMeasuredSizesChanged={onMeasuredSizesChanged}
        >
          <SideBar projectId={activeBot} />
          <div css={contentWrapper} role="main">
            <CommandBar projectId={activeBot} />
            <Conversation css={editorContainer}>
              <div css={editorWrapper}>
                <Split
                  resetOnDoubleClick
                  initialPrimarySize="65%"
                  minPrimarySize="500px"
                  minSecondarySize="350px"
                  renderSplitter={renderThinSplitter}
                >
                  <VisualPanel projectId={activeBot} />
                  <PropertyPanel isSkill={activeBot !== projectId} projectId={activeBot} />
                </Split>
              </div>
            </Conversation>
          </div>
        </Split>
        <Modals projectId={activeBot} />
        <div
          css={{
            height: '100%',
            width: '200px',
            float: 'right',
            background: 'black',
          }}
        >
          WEBCHAT
        </div>
        <DebugPanel />
      </div>
    </div>
  );
};

export default DesignPage;
