// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { RouteComponentProps } from '@reach/router';
import { useRecoilValue } from 'recoil';
import { Split, SplitMeasuredSizes } from '@geoffcox/react-splitter';
import { useEffect, useRef } from 'react';
import { NeutralColors } from '@uifabric/fluent-theme';

import { dispatcherState, currentDialogState, showProjectTreePanelState } from '../../recoilModel';
import { renderThinSplitter } from '../../components/Split/ThinSplitter';
import { Conversation } from '../../components/Conversation';
import { useSurveyNotification } from '../../components/Notifications/useSurveyNotification';
import { useAutoSave } from '../../hooks/useAutoSave';

import SideBar from './SideBar';
import CommandBar from './CommandBar';
import VisualPanel from './VisualPanel';
import useEmptyPropsHandler from './useEmptyPropsHandler';
import { contentWrapper, splitPaneContainer, splitPaneWrapper } from './styles';
import Modals from './Modals';

const autoSaveIntervalTime = 30 * 1000;

const DesignPage: React.FC<RouteComponentProps<{ dialogId: string; projectId: string; skillId?: string }>> = (
  props
) => {
  const { projectId = '', skillId, location, dialogId } = props;
  const autoSave = useAutoSave();
  const autoSaveTimer = useRef<NodeJS.Timer | undefined>();

  useEmptyPropsHandler(projectId, location, skillId, dialogId);
  const { setAutoSaveState, setPageElementState } = useRecoilValue(dispatcherState);
  const currentDialog = useRecoilValue(currentDialogState({ dialogId, projectId }));
  const showTreePanel = useRecoilValue(showProjectTreePanelState);

  const onMeasuredSizesChanged = (sizes: SplitMeasuredSizes) => {
    setPageElementState('dialogs', { leftSplitWidth: sizes.primary });
  };

  const activeBot = skillId ?? projectId;

  useSurveyNotification();

  useEffect(() => {
    autoSaveTimer.current = setInterval(async () => {
      setAutoSaveState('Pending');
      await autoSave();
      setAutoSaveState('RecentlySaved');
    }, autoSaveIntervalTime);

    return () => {
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
        setAutoSaveState('Idle');
      }
    };
  }, [autoSaveTimer, projectId]);

  const designPanelWidth = showTreePanel ? '80%' : '100%';

  const treePanelStyle = css`
    display: flex;
    position: relative;
    width: 20%;
    min-width: 200px;
    height: 100%;
    border-right: 1px solid ${NeutralColors.gray30};
  `;
  const designPanelStyle = css`
    display: flex;
    position: relative;
    width: ${designPanelWidth};
    height: 100%;
  `;

  const parentWrapper = css`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    height: 100%;
    position: relative;
    label: DesignPageContent;
  `;

  return (
    <div css={parentWrapper} role="main">
      {showTreePanel ? (
        <div css={treePanelStyle}>
          <div css={contentWrapper}>
            <div css={splitPaneContainer}>
              <div css={splitPaneWrapper}>
                <SideBar projectId={activeBot} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div css={designPanelStyle}>
        <div css={contentWrapper} role="main">
          <CommandBar projectId={activeBot} />
          <Conversation css={splitPaneContainer}>
            <div css={splitPaneWrapper}>
              <VisualPanel projectId={activeBot} />
            </div>
          </Conversation>
        </div>
      </div>
      <Modals projectId={activeBot} rootBotId={projectId} />
    </div>
  );
};
// {currentDialog?.isTopic ? (
//   <VisualPanel projectId={activeBot} />
// ) : (
//   <Split
//     resetOnDoubleClick
//     initialPrimarySize="65%"
//     minPrimarySize="500px"
//     minSecondarySize="350px"
//     renderSplitter={renderThinSplitter}
//   >
//     <VisualPanel projectId={activeBot} />
//     <PropertyPanel isSkill={activeBot !== projectId} projectId={activeBot} />
//   </Split>
// )}

export default DesignPage;
