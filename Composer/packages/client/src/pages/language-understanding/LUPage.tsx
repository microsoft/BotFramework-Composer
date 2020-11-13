// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, Suspense, useCallback, useEffect } from 'react';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { RouteComponentProps, Router } from '@reach/router';
import { useRecoilValue } from 'recoil';

import { navigateTo, buildURL } from '../../utils/navigation';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Page } from '../../components/Page';
import { validateDialogsSelectorFamily, dispatcherState } from '../../recoilModel';

import TableView from './table-view';
const CodeEditor = React.lazy(() => import('./code-editor'));

const LUPage: React.FC<RouteComponentProps<{
  dialogId: string;
  projectId: string;
  skillId?: string;
}>> = (props) => {
  const { dialogId = '', projectId = '', skillId } = props;
  const dialogs = useRecoilValue(validateDialogsSelectorFamily(skillId ?? projectId ?? ''));

  const { setCurrentPageMode } = useRecoilValue(dispatcherState);
  useEffect(() => {
    setCurrentPageMode('lu');
  }, []);

  const path = props.location?.pathname ?? '';
  const edit = /\/edit(\/)?$/.test(path);
  const isRoot = dialogId === 'all';

  useEffect(() => {
    const activeDialog = dialogs.find(({ id }) => id === dialogId);
    if (!activeDialog && dialogId !== 'all' && dialogs.length) {
      navigateTo(buildURL('lu', { projectId }));
    }
  }, [dialogId, dialogs, projectId]);

  const onToggleEditMode = useCallback(() => {
    let url = buildURL('lu', { projectId, dialogId });
    if (!edit) url += `/edit`;
    navigateTo(url);
  }, [dialogId, projectId, edit]);

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
      data-testid="LUPage"
      mainRegionName={formatMessage('LU editor')}
      navRegionName={formatMessage('LU Navigation Pane')}
      title={formatMessage('User Input')}
      toolbarItems={[]}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Router component={Fragment} primary={false}>
          <CodeEditor dialogId={dialogId} path="/edit" projectId={projectId} skillId={skillId} />
          <TableView path="/" />
        </Router>
      </Suspense>
    </Page>
  );
};

export default LUPage;
