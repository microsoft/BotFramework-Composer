// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { Fragment, useMemo, useCallback, Suspense, useEffect, useState } from 'react';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { RouteComponentProps, Router } from '@reach/router';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { navigateTo } from '../../utils/navigation';
import { INavTreeItem } from '../../components/NavTree';
import { Page } from '../../components/Page';
import { dialogsSelectorFamily, qnaFilesState } from '../../recoilModel';
import { dispatcherState } from '../../recoilModel';
import { CreateQnAModal } from '../../components/QnA';

import TableView from './table-view';

const CodeEditor = React.lazy(() => import('./code-editor'));

const QnAPage: React.FC<RouteComponentProps<{
  dialogId: string;
  projectId: string;
  skillId: string;
}>> = (props) => {
  const { dialogId = '', projectId = '', skillId = '' } = props;
  const currentBotProjectId = skillId ?? projectId;
  const baseURL = skillId == null ? `/bot/${projectId}/` : `/bot/${projectId}/skill/${skillId}/`;

  const actions = useRecoilValue(dispatcherState);
  const dialogs = useRecoilValue(dialogsSelectorFamily(currentBotProjectId));
  const qnaFiles = useRecoilValue(qnaFilesState(currentBotProjectId));
  //To do: support other languages
  const locale = 'en-us';
  //const locale = useRecoilValue(localeState);
  const [createOnDialogId, setCreateOnDialogId] = useState('');

  const path = props.location?.pathname ?? '';

  const edit = /\/edit(\/)?$/.test(path);
  const isRoot = dialogId === 'all';
  const navLinks: INavTreeItem[] = useMemo(() => {
    const newDialogLinks: INavTreeItem[] = dialogs.map((dialog) => {
      return {
        id: dialog.id,
        name: dialog.displayName,
        ariaLabel: formatMessage('qna file'),
        url: `${baseURL}knowledge-base/${dialog.id}`,
        menuIconProps: {
          iconName: 'Add',
        },
        menuItems: [
          {
            name: formatMessage('Create KB from scratch'),
            key: 'Create KB from scratch',
            onClick: () => {
              setCreateOnDialogId(dialog.id);
              actions.createQnAFromScratchDialogBegin({ projectId: currentBotProjectId });
            },
          },
          {
            name: formatMessage('Create KB from URL or file'),
            key: 'Create KB from URL or file',
            onClick: () => {
              setCreateOnDialogId(dialog.id);
              actions.createQnAFromUrlDialogBegin({ projectId: currentBotProjectId });
            },
          },
        ],
      };
    });
    const mainDialogIndex = newDialogLinks.findIndex((link) => link.id === 'Main');

    if (mainDialogIndex > -1) {
      const mainDialog = newDialogLinks.splice(mainDialogIndex, 1)[0];
      newDialogLinks.splice(0, 0, mainDialog);
    }
    newDialogLinks.splice(0, 0, {
      id: 'all',
      name: 'All',
      ariaLabel: formatMessage('all qna files'),
      url: `${baseURL}knowledge-base/all`,
    });
    return newDialogLinks;
  }, [dialogs]);

  useEffect(() => {
    setCreateOnDialogId('');
    const activeDialog = dialogs.find(({ id }) => id === dialogId);
    if (!activeDialog && dialogs.length && dialogId !== 'all') {
      navigateTo(`${baseURL}knowledge-base/${dialogId}`);
    }
  }, [dialogId, dialogs, currentBotProjectId]);

  const onToggleEditMode = useCallback(
    (_e) => {
      let url = `${baseURL}knowledge-base/${dialogId}`;
      if (!edit) url += `/edit`;
      navigateTo(url);
    },
    [dialogId, currentBotProjectId, edit]
  );

  useEffect(() => {
    actions.setCurrentPageMode('qna');
  }, []);

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
      data-testid="QnAPage"
      mainRegionName={formatMessage('QnA editor')}
      navLinks={navLinks}
      navRegionName={formatMessage('Qna Navigation Pane')}
      title={formatMessage('QnA')}
      toolbarItems={[]}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Router component={Fragment} primary={false}>
          <CodeEditor dialogId={dialogId} path="/edit" projectId={currentBotProjectId} skillId={skillId} />
          <TableView dialogId={dialogId} path="/" projectId={currentBotProjectId} skillId={skillId} />
        </Router>
        <CreateQnAModal
          dialogId={createOnDialogId || dialogId}
          projectId={currentBotProjectId}
          qnaFiles={qnaFiles}
          onDismiss={() => {
            actions.createQnAFromUrlDialogCancel({ projectId: currentBotProjectId });
          }}
          onSubmit={async ({ name, url, multiTurn = false }) => {
            if (url) {
              await actions.createQnAKBFromUrl({
                id: `${createOnDialogId || dialogId}.${locale}`,
                name,
                url,
                multiTurn,
                projectId: currentBotProjectId,
              });
            } else {
              await actions.createQnAKBFromScratch({
                id: `${createOnDialogId || dialogId}.${locale}`,
                name,
                projectId: currentBotProjectId,
              });
            }
          }}
        ></CreateQnAModal>
      </Suspense>
    </Page>
  );
};

export default QnAPage;
