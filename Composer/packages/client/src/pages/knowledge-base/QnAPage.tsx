// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { Fragment, useCallback, Suspense, useEffect, useState, useMemo } from 'react';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { RouteComponentProps, Router } from '@reach/router';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { navigateTo } from '../../utils/navigation';
import { Page } from '../../components/Page';
import {
  dialogIdsState,
  qnaFilesSelectorFamily,
  dispatcherState,
  createQnAOnState,
  localeState,
  settingsState,
} from '../../recoilModel';
import { CreateQnAModal } from '../../components/QnA';
import TelemetryClient from '../../telemetry/TelemetryClient';

import TableView, { qnaSuffix } from './table-view';
import { TabHeader } from './TabHeader';

const CodeEditor = React.lazy(() => import('./code-editor'));

const qnaContentStyle = css`
  flex-grow: 1;
  height: 0;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  padding: 0px;
`;

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
  const qnaFiles = useRecoilValue(qnaFilesSelectorFamily(actualProjectId));
  const locale = useRecoilValue(localeState(actualProjectId));
  const createQnAOnInfo = useRecoilValue(createQnAOnState);
  const settings = useRecoilValue(settingsState(actualProjectId));
  const { defaultLanguage } = settings;
  const languages = defaultLanguage === locale ? [defaultLanguage] : [locale, defaultLanguage];
  const [currentLocale, setCurrentLocale] = useState(locale);

  const showTabBar = useMemo(() => {
    const targetFileId = dialogId.endsWith(qnaSuffix(locale)) ? dialogId : `${dialogId}.${locale}`;
    const qnaFile = qnaFiles.find(({ id }) => id === qnaFileId ?? targetFileId);
    return !(defaultLanguage === locale || qnaFile?.empty);
  }, [defaultLanguage, locale, qnaFiles, dialogId, qnaFileId]);

  useEffect(() => {
    if (locale !== currentLocale) {
      setCurrentLocale(locale);
    }
  }, [locale]);

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

  const onRenderContent = () => (
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
  );

  return (
    <Page
      useDebugPane
      useNewTree
      contentStyle={qnaContentStyle}
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
        {showTabBar ? (
          <TabHeader
            defaultLanguage={defaultLanguage}
            languages={languages}
            locale={currentLocale}
            onChangeLocale={onChangeLocale}
          >
            {onRenderContent()}
          </TabHeader>
        ) : (
          <div css={{ overflowY: 'auto', height: '100%' }}>{onRenderContent()}</div>
        )}
        <CreateQnAModal
          dialogId={createQnAOnInfo.dialogId}
          projectId={createQnAOnInfo.projectId}
          qnaFiles={qnaFiles}
          onDismiss={() => {
            actions.createQnAFromUrlDialogCancel({ projectId: createQnAOnInfo.projectId });
          }}
          onSubmit={async ({ name, urls = [], locales = [], multiTurn = false }) => {
            if (urls.length !== 0) {
              actions.createQnAKBsFromUrls({ id: createQnAOnInfo.dialogId, name, projectId, locales, urls, multiTurn });
            } else {
              await actions.createQnAKBFromScratch({
                id: createQnAOnInfo.dialogId,
                name,
                projectId: createQnAOnInfo.projectId,
              });
            }
          }}
        ></CreateQnAModal>
      </Suspense>
    </Page>
  );
};

export default QnAPage;
