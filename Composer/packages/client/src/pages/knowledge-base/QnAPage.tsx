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
import { TestController } from '../../components/TestController/TestController';
import { INavTreeItem } from '../../components/NavTree';
import { Page } from '../../components/Page';
import { dialogsState, qnaFilesState } from '../../recoilModel/atoms/botState';
import { dispatcherState } from '../../recoilModel';
import { CreateQnAModal } from '../../components/QnA';

import TableView from './table-view';

const CodeEditor = React.lazy(() => import('./code-editor'));

interface QnAPageProps extends RouteComponentProps<{}> {
  projectId?: string;
  dialogId?: string;
}

const QnAPage: React.FC<QnAPageProps> = (props) => {
  const { dialogId = '', projectId = '' } = props;

  const actions = useRecoilValue(dispatcherState);
  const dialogs = useRecoilValue(dialogsState(projectId));
  const qnaFiles = useRecoilValue(qnaFilesState(projectId));
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
        url: `/bot/${projectId}/knowledge-base/${dialog.id}`,
        menuIconProps: {
          iconName: 'Add',
        },
        menuItems: [
          {
            name: formatMessage('Create KB from scratch'),
            key: 'Create KB from scratch',
            onClick: () => {
              setCreateOnDialogId(dialog.id);
              actions.createQnAFromScratchDialogBegin({ projectId });
            },
          },
          {
            name: formatMessage('Create KB from URL or file'),
            key: 'Create KB from URL or file',
            onClick: () => {
              setCreateOnDialogId(dialog.id);
              actions.createQnAFromUrlDialogBegin({ projectId, showFromScratch: false });
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
      url: `/bot/${projectId}/knowledge-base/all`,
    });
    return newDialogLinks;
  }, [dialogs]);

  useEffect(() => {
    setCreateOnDialogId('');
    const activeDialog = dialogs.find(({ id }) => id === dialogId);
    if (!activeDialog && dialogs.length && dialogId !== 'all') {
      navigateTo(`/bot/${projectId}/knowledge-base/${dialogId}`);
    }
  }, [dialogId, dialogs, projectId]);

  const onToggleEditMode = useCallback(
    (_e) => {
      let url = `/bot/${projectId}/knowledge-base/${dialogId}`;
      if (!edit) url += `/edit`;
      navigateTo(url);
    },
    [dialogId, projectId, edit]
  );

  useEffect(() => {
    actions.setCurrentPageMode('qna');
  }, []);

  const toolbarItems = [
    {
      type: 'element',
      element: <TestController projectId={projectId} />,
      align: 'right',
    },
  ];

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
      toolbarItems={toolbarItems}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Router component={Fragment} primary={false}>
          <CodeEditor dialogId={dialogId} path="/edit" projectId={projectId} />
          <TableView dialogId={dialogId} path="/" projectId={projectId} />
        </Router>
        <CreateQnAModal
          dialogId={createOnDialogId || dialogId}
          projectId={projectId}
          qnaFiles={qnaFiles}
          onDismiss={() => {
            actions.createQnAFromUrlDialogCancel({ projectId });
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
