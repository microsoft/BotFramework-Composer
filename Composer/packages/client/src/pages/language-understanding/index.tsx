// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, Fragment, useMemo, Suspense, useCallback, useEffect } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { RouteComponentProps, Router } from '@reach/router';

import { StoreContext } from '../../store';
import { navigateTo } from '../../utils';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ToolBar } from '../../components/ToolBar/index';
import { TestController } from '../../components/TestController';
import { DialogTree } from '../../components/DialogTree';

import TableView from './table-view';
import {
  ContentHeaderStyle,
  ContentStyle,
  flexContent,
  actionButton,
  contentEditor,
  HeaderText,
  pageRoot,
  contentWrapper,
} from './styles';
const CodeEditor = React.lazy(() => import('./code-editor'));

interface LUPageProps extends RouteComponentProps<{}> {
  dialogId?: string;
  path: string;
}

const LUPage: React.FC<LUPageProps> = (props) => {
  const { state } = useContext(StoreContext);
  const { dialogs, projectId } = state;
  const path = props.location?.pathname ?? '';
  const { dialogId = '' } = props;
  const edit = /\/edit(\/)?$/.test(path);
  const isRoot = dialogId === 'all';

  const navLinks = useMemo(() => {
    const newDialogLinks = dialogs.map((dialog) => {
      return {
        id: dialog.id,
        url: dialog.id,
        key: dialog.id,
        name: dialog.displayName,
        ariaLabel: formatMessage('language understanding file'),
      };
    });
    const mainDialogIndex = newDialogLinks.findIndex((link) => link.id === 'Main');

    if (mainDialogIndex > -1) {
      const mainDialog = newDialogLinks.splice(mainDialogIndex, 1)[0];
      newDialogLinks.splice(0, 0, mainDialog);
    }
    newDialogLinks.splice(0, 0, {
      id: 'all',
      key: 'all',
      name: 'All',
      ariaLabel: formatMessage('all language understanding files'),
      url: '',
    });
    return newDialogLinks;
  }, [dialogs]);

  useEffect(() => {
    const activeDialog = dialogs.find(({ id }) => id === dialogId);
    if (!activeDialog && dialogId !== 'all' && dialogs.length) {
      navigateTo(`/bot/${projectId}/language-understanding/all`);
    }
  }, [dialogId, dialogs, projectId]);

  const onSelect = useCallback(
    (id) => {
      const url = `/bot/${projectId}/language-understanding/${id}`;
      navigateTo(url);
    },
    [edit, projectId]
  );

  const onToggleEditMode = useCallback(
    (_e, checked) => {
      let url = `/bot/${projectId}/language-understanding/${dialogId}`;
      if (checked) url += `/edit`;
      navigateTo(url);
    },
    [dialogId, projectId]
  );

  const toolbarItems = [
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  return (
    <div css={pageRoot} data-testid="LUPage">
      <div css={contentWrapper}>
        <ToolBar toolbarItems={toolbarItems} />
        <div css={ContentHeaderStyle}>
          <h1 css={HeaderText}>{formatMessage('User Input')}</h1>
          <div css={flexContent}>
            {(!isRoot || edit) && (
              <Toggle
                checked={!!edit}
                className={'toggleEditMode'}
                css={actionButton}
                defaultChecked={false}
                offText={formatMessage('Edit mode')}
                onChange={onToggleEditMode}
                onText={formatMessage('Edit mode')}
              />
            )}
          </div>
        </div>
        <div css={ContentStyle} role="main">
          <DialogTree dialogId={dialogId} navLinks={navLinks} onSelect={onSelect} />
          <div css={contentEditor} data-testid="LUEditor">
            <Suspense fallback={<LoadingSpinner />}>
              <Router component={Fragment} primary={false}>
                <CodeEditor dialogId={dialogId} path="/edit" />
                <TableView dialogId={dialogId} path="/" />
              </Router>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LUPage;
