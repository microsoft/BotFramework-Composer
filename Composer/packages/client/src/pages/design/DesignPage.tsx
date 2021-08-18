// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { RouteComponentProps } from '@reach/router';
import { useRecoilValue } from 'recoil';
import { Split, SplitMeasuredSizes } from '@geoffcox/react-splitter';
import { useEffect, useRef } from 'react';

import { dispatcherState, currentDialogState } from '../../recoilModel';
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
  const { setPageElementState } = useRecoilValue(dispatcherState);
  const currentDialog = useRecoilValue(currentDialogState({ dialogId, projectId }));

  const onMeasuredSizesChanged = (sizes: SplitMeasuredSizes) => {
    setPageElementState('dialogs', { leftSplitWidth: sizes.primary });
  };

  const activeBot = skillId ?? projectId;

  useSurveyNotification();

  useEffect(() => {
    autoSaveTimer.current = setInterval(async () => {
      await autoSave();
    }, autoSaveIntervalTime);

    return () => {
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }
    };
  }, [autoSaveTimer, projectId]);

  return (
    <div css={contentWrapper} role="main">
      <Split
        resetOnDoubleClick
        initialPrimarySize="20%"
        minPrimarySize="200px"
        minSecondarySize="800px"
        renderSplitter={renderThinSplitter}
        splitterSize="5px"
        onMeasuredSizesChanged={onMeasuredSizesChanged}
      >
        <div css={contentWrapper}>
          <div css={splitPaneContainer}>
            <div css={splitPaneWrapper}>
              <SideBar projectId={activeBot} />
            </div>
          </div>
        </div>

        <div css={contentWrapper} role="main">
          <CommandBar projectId={activeBot} />
          <Conversation css={splitPaneContainer}>
            <div css={splitPaneWrapper}>
              <VisualPanel projectId={activeBot} />
            </div>
          </Conversation>
        </div>
      </Split>
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
