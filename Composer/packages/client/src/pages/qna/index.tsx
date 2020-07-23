// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { Fragment, useMemo, useCallback, Suspense, useEffect, useState } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { RouteComponentProps, Router } from '@reach/router';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { actionButton } from '../language-understanding/styles';
import { navigateTo } from '../../utils/navigation';
import { TestController } from '../../components/TestController/TestController';
import { INavTreeItem } from '../../components/NavTree';
import { Page } from '../../components/Page';
import {
  dialogsState,
  qnaFilesState,
  localeState,
  projectIdState,
  qnaAllUpViewStatusState,
} from '../../recoilModel/atoms/botState';
import { dispatcherState } from '../../recoilModel';
import { QnAAllUpViewStatus } from '../../recoilModel/types';

import TableView from './table-view';
import { ImportQnAFromUrlModal } from './ImportQnAFromUrlModal';

const CodeEditor = React.lazy(() => import('./code-editor'));

interface QnAPageProps extends RouteComponentProps<{}> {
  dialogId?: string;
}

const QnAPage: React.FC<QnAPageProps> = (props) => {
  const actions = useRecoilValue(dispatcherState);
  const dialogs = useRecoilValue(dialogsState);
  const qnaFiles = useRecoilValue(qnaFilesState);
  const projectId = useRecoilValue(projectIdState);
  const locale = useRecoilValue(localeState);
  const qnaAllUpViewStatus = useRecoilValue(qnaAllUpViewStatusState);
  const [importQnAFromUrlModalVisiability, setImportQnAFromUrlModalVisiability] = useState(false);

  const path = props.location?.pathname ?? '';
  const { dialogId = '' } = props;
  const edit = /\/edit(\/)?$/.test(path);
  const isRoot = dialogId === 'all';
  const qnaFile = qnaFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const qnaFileContent = qnaFile ? qnaFile.content : '';
  const navLinks: INavTreeItem[] = useMemo(() => {
    const newDialogLinks: INavTreeItem[] = dialogs.map((dialog) => {
      return {
        id: dialog.id,
        name: dialog.displayName,
        ariaLabel: formatMessage('qna file'),
        url: `/bot/${projectId}/qna/${dialog.id}`,
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
      url: `/bot/${projectId}/qna/all`,
    });
    return newDialogLinks;
  }, [dialogs]);

  useEffect(() => {
    const activeDialog = dialogs.find(({ id }) => id === dialogId);
    if (!activeDialog && dialogs.length && dialogId !== 'all') {
      navigateTo(`/bot/${projectId}/qna/${dialogId}`);
    }
  }, [dialogId, dialogs, projectId]);

  const onToggleEditMode = useCallback(
    (_e, checked) => {
      let url = `/bot/${projectId}/qna/${dialogId}`;
      if (checked) url += `/edit`;
      navigateTo(url);
    },
    [dialogId, projectId]
  );

  const toolbarItems = [
    {
      type: 'dropdown',
      text: formatMessage('Add'),
      align: 'left',
      dataTestid: 'AddFlyout',
      buttonProps: {
        iconProps: { iconName: 'Add' },
      },
      menuProps: {
        items: [
          {
            'data-testid': 'FlyoutNewDialog',
            key: 'importQnAFromUrl',
            text: formatMessage('Import QnA From Url'),
            onClick: () => {
              setImportQnAFromUrlModalVisiability(true);
            },
          },
        ],
      },
    },
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  const onRenderHeaderContent = () => {
    if (!isRoot || edit) {
      return (
        <Toggle
          checked={!!edit}
          className={'toggleEditMode'}
          css={actionButton}
          defaultChecked={false}
          offText={formatMessage('Edit mode')}
          onChange={onToggleEditMode}
          onText={formatMessage('Edit mode')}
        />
      );
    }
    return null;
  };

  const onDismiss = () => {
    setImportQnAFromUrlModalVisiability(false);
  };

  const onSubmit = (location: string, subscriptionKey: string, region: string) => {
    actions.importQnAFromUrl({
      id: `${dialogId}.${locale}`,
      qnaFileContent,
      subscriptionKey,
      url: location,
      region,
    });
    setImportQnAFromUrlModalVisiability(false);
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
          <CodeEditor dialogId={dialogId} path="/edit" />
          {qnaAllUpViewStatus === QnAAllUpViewStatus.Success && <TableView dialogId={dialogId} path="/" />}
        </Router>
        {qnaAllUpViewStatus === QnAAllUpViewStatus.Loading && <LoadingSpinner />}
        {setImportQnAFromUrlModalVisiability && (
          <ImportQnAFromUrlModal
            dialogId={dialogId}
            isOpen={importQnAFromUrlModalVisiability}
            onDismiss={onDismiss}
            onSubmit={onSubmit}
          />
        )}
      </Suspense>
    </Page>
  );
};

export default QnAPage;
