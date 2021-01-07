// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { Fragment, useCallback, Suspense, useEffect } from 'react';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { RouteComponentProps, Router } from '@reach/router';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { navigateTo } from '../../utils/navigation';
import { Page } from '../../components/Page';
import { dialogIdsState, qnaFilesState, dispatcherState, createQnAOnState } from '../../recoilModel';
import { CreateQnAModal } from '../../components/QnA';
import TelemetryClient from '../../telemetry/TelemetryClient';

import TableView from './table-view';

const CodeEditor = React.lazy(() => import('./code-editor'));

const QnAPage: React.FC<RouteComponentProps<{
  dialogId: string;
  projectId: string;
  skillId: string;
}>> = (props) => {
  const { dialogId = '', projectId = '', skillId } = props;

  const actualProjectId = skillId ?? projectId;
  const baseURL = skillId == null ? `/bot/${projectId}/` : `/bot/${projectId}/skill/${skillId}/`;

  const actions = useRecoilValue(dispatcherState);
  const dialogs = useRecoilValue(dialogIdsState(actualProjectId));
  const qnaFiles = useRecoilValue(qnaFilesState(actualProjectId));
  //To do: support other languages
  const locale = 'en-us';
  //const locale = useRecoilValue(localeState);
  const creatQnAOnInfo = useRecoilValue(createQnAOnState);

  const path = props.location?.pathname ?? '';

  const edit = /\/edit(\/)?$/.test(path);
  const isRoot = dialogId === 'all';

  useEffect(() => {
    const activeDialog = dialogs.find((id) => id === dialogId);
    if (!activeDialog && dialogs.length && dialogId !== 'all') {
      navigateTo(`${baseURL}knowledge-base/${dialogId}`);
    }
  }, [dialogId, dialogs, actualProjectId]);

  const onToggleEditMode = useCallback(
    (_e) => {
      let url = `${baseURL}knowledge-base/${dialogId}`;
      if (!edit) url += `/edit`;
      navigateTo(url);
      TelemetryClient.track('EditModeToggled', { jsonView: !edit });
    },
    [dialogId, actualProjectId, edit]
  );

  const onRenderHeaderContent = () => {
    if (!isRoot) {
      return (
        <ActionButton data-testid="showcode" onClick={onToggleEditMode}>
          {edit ? formatMessage('Hide code') : formatMessage('Show code')}
        </ActionButton>
      );
    }
    return null;
  };

  return (
    <Page
      useNewTree
      data-testid="QnAPage"
      dialogId={dialogId}
      mainRegionName={formatMessage('QnA editor')}
      navRegionName={formatMessage('Qna Navigation Pane')}
      pageMode={'knowledge-base'}
      projectId={projectId}
      skillId={skillId}
      title={formatMessage('QnA')}
      toolbarItems={[]}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Router component={Fragment} primary={false}>
          <CodeEditor dialogId={dialogId} path="/edit" projectId={projectId} skillId={skillId} />
          <TableView path="/" projectId={projectId} />
        </Router>
        <CreateQnAModal
          dialogId={creatQnAOnInfo.dialogId}
          projectId={creatQnAOnInfo.projectId}
          qnaFiles={qnaFiles}
          onDismiss={() => {
            actions.createQnAFromUrlDialogCancel({ projectId: creatQnAOnInfo.projectId });
          }}
          onSubmit={async ({ name, url, multiTurn = false }) => {
            if (url) {
              await actions.createQnAKBFromUrl({
                id: `${creatQnAOnInfo.dialogId}.${locale}`,
                name,
                url,
                multiTurn,
                projectId: creatQnAOnInfo.projectId,
              });
            } else {
              await actions.createQnAKBFromScratch({
                id: `${creatQnAOnInfo.dialogId}.${locale}`,
                name,
                projectId: creatQnAOnInfo.projectId,
              });
            }
          }}
        ></CreateQnAModal>
      </Suspense>
    </Page>
  );
};

export default QnAPage;
