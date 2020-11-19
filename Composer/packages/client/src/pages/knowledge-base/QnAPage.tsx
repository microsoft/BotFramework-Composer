// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { Fragment, useCallback, Suspense, useEffect, useState } from 'react';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { RouteComponentProps, Router } from '@reach/router';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { navigateTo } from '../../utils/navigation';
import { Page } from '../../components/Page';
import { dialogsSelectorFamily, qnaFilesState, dispatcherState } from '../../recoilModel';
import { CreateQnAModal } from '../../components/QnA';

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
  const dialogs = useRecoilValue(dialogsSelectorFamily(actualProjectId));
  const qnaFiles = useRecoilValue(qnaFilesState(actualProjectId));
  //To do: support other languages
  const locale = 'en-us';
  //const locale = useRecoilValue(localeState);
  const [createOnDialogId, setCreateOnDialogId] = useState('');

  const { setCurrentPageMode } = useRecoilValue(dispatcherState);
  useEffect(() => {
    setCurrentPageMode('knowledge-base');
  }, []);
  const path = props.location?.pathname ?? '';

  const edit = /\/edit(\/)?$/.test(path);
  const isRoot = dialogId === 'all';

  useEffect(() => {
    setCreateOnDialogId('');
    const activeDialog = dialogs.find(({ id }) => id === dialogId);
    if (!activeDialog && dialogs.length && dialogId !== 'all') {
      navigateTo(`${baseURL}knowledge-base/${dialogId}`);
    }
  }, [dialogId, dialogs, actualProjectId]);

  const onToggleEditMode = useCallback(
    (_e) => {
      let url = `${baseURL}knowledge-base/${dialogId}`;
      if (!edit) url += `/edit`;
      navigateTo(url);
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
      mainRegionName={formatMessage('QnA editor')}
      navRegionName={formatMessage('Qna Navigation Pane')}
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
          dialogId={createOnDialogId || dialogId}
          projectId={actualProjectId}
          qnaFiles={qnaFiles}
          onDismiss={() => {
            actions.createQnAFromUrlDialogCancel({ projectId: actualProjectId });
          }}
          onSubmit={async ({ name, url, multiTurn = false }) => {
            if (url) {
              await actions.createQnAKBFromUrl({
                id: `${createOnDialogId || dialogId}.${locale}`,
                name,
                url,
                multiTurn,
                projectId,
              });
            } else {
              await actions.createQnAKBFromScratch({
                id: `${createOnDialogId || dialogId}.${locale}`,
                name,
                projectId,
              });
            }
          }}
        ></CreateQnAModal>
      </Suspense>
    </Page>
  );
};

export default QnAPage;
