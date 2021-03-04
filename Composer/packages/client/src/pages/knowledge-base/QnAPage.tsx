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
import {
  dialogIdsState,
  qnaFilesState,
  dispatcherState,
  createQnAOnState,
  localeState,
  settingsState,
} from '../../recoilModel';
import { CreateQnAModal } from '../../components/QnA';
import TelemetryClient from '../../telemetry/TelemetryClient';

import TableView from './table-view';
import { TabHeader } from './TabHeader';

const CodeEditor = React.lazy(() => import('./code-editor'));

const QnAPage: React.FC<RouteComponentProps<{
  dialogId: string;
  projectId: string;
  skillId: string;
  qnaFileId: string;
}>> = (props) => {
  const { dialogId = '', projectId = '', skillId, qnaFileId = '' } = props;

  const actualProjectId = skillId ?? projectId;
  const baseURL = skillId == null ? `/bot/${projectId}/` : `/bot/${projectId}/skill/${skillId}/`;

  const actions = useRecoilValue(dispatcherState);
  const dialogs = useRecoilValue(dialogIdsState(actualProjectId));
  const qnaFiles = useRecoilValue(qnaFilesState(actualProjectId));
  const locale = useRecoilValue(localeState(actualProjectId));
  const creatQnAOnInfo = useRecoilValue(createQnAOnState);
  const settings = useRecoilValue(settingsState(actualProjectId));
  const { languages, defaultLanguage } = settings;
  const [currentLocale, setCurrentLocale] = useState(locale);

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

  const onChangeLocale = (locale) => {
    setCurrentLocale(locale);
  };

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
      useDebugPane
      useNewTree
      data-testid="QnAPage"
      dialogId={dialogId}
      mainRegionName={formatMessage('QnA editor')}
      navRegionName={formatMessage('Qna Navigation Pane')}
      pageMode={'knowledge-base'}
      projectId={projectId}
      skillId={skillId}
      title={formatMessage('Knowledge(QnA)')}
      toolbarItems={[]}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <TabHeader
          defaultLanguage={defaultLanguage}
          languages={languages}
          locale={currentLocale}
          onChangeLocale={onChangeLocale}
        >
          <Router component={Fragment} primary={false}>
            <CodeEditor
              dialogId={dialogId}
              locale={currentLocale}
              path="/edit"
              projectId={projectId}
              qnaFileId={qnaFileId}
              skillId={skillId}
            />
            <TableView
              dialogId={dialogId}
              locale={currentLocale}
              path="/"
              projectId={projectId}
              qnaFileId={qnaFileId}
              skillId={skillId}
            />
          </Router>
        </TabHeader>
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
