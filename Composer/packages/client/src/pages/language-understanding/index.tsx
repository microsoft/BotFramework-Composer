// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, Fragment, useMemo, Suspense, useCallback, useEffect } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { RouteComponentProps, Router } from '@reach/router';

import { StoreContext } from '../../store';
import { projectContainer } from '../design/styles';
import { navigateTo } from '../../utils';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ToolBar } from '../../components/ToolBar/index';
import { TestController } from '../../TestController';
import { NavLinks } from '../../components/NavLinks';

import TableView from './table-view';
import {
  ContentHeaderStyle,
  ContentStyle,
  flexContent,
  actionButton,
  contentEditor,
  dialogItem,
  HeaderText,
} from './styles';
const CodeEditor = React.lazy(() => import('./code-editor'));

interface LUPageProps extends RouteComponentProps<{}> {
  fileId?: string;
  path: string;
}

const LUPage: React.FC<LUPageProps> = props => {
  const { state } = useContext(StoreContext);
  const { dialogs } = state;
  const path = props.location?.pathname ?? '';
  const { fileId = '' } = props;
  const edit = /\/edit(\/)?$/.test(path);
  const isRoot = fileId === 'all';

  const navLinks = useMemo(() => {
    const newDialogLinks = dialogs.map(dialog => {
      return { id: dialog.id, url: dialog.id, key: dialog.id, name: dialog.displayName };
    });
    const mainDialogIndex = newDialogLinks.findIndex(link => link.id === 'Main');

    if (mainDialogIndex > -1) {
      const mainDialog = newDialogLinks.splice(mainDialogIndex, 1)[0];
      newDialogLinks.splice(0, 0, mainDialog);
    }
    return newDialogLinks;
  }, [dialogs]);

  useEffect(() => {
    const activeDialog = dialogs.find(({ id }) => id === fileId);
    if (!activeDialog && fileId !== 'all' && dialogs.length) {
      navigateTo('/language-understanding/all');
    }
  }, [fileId, dialogs]);

  const onSelect = useCallback(
    id => {
      const url = `/language-understanding/${id}`;
      navigateTo(url);
    },
    [edit]
  );

  const onToggleEditMode = useCallback(
    (_e, checked) => {
      let url = `/language-understanding/${fileId}`;
      if (checked) url += `/edit`;
      navigateTo(url);
    },
    [fileId]
  );

  const toolbarItems = [
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  return (
    <Fragment>
      <ToolBar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <div css={HeaderText}>{formatMessage('User Input')}</div>
        <div css={flexContent}>
          <Toggle
            className={'toggleEditMode'}
            css={actionButton}
            onText={formatMessage('Edit mode')}
            offText={formatMessage('Edit mode')}
            defaultChecked={false}
            checked={!!edit}
            disabled={isRoot && edit === false}
            onChange={onToggleEditMode}
          />
        </div>
      </div>
      <div css={ContentStyle} data-testid="LUEditor">
        <div css={projectContainer}>
          <div
            css={dialogItem(isRoot)}
            key={'_all'}
            onClick={() => {
              onSelect('all');
            }}
          >
            {'All'}
          </div>
          <NavLinks navLinks={navLinks} onSelect={onSelect} fileId={fileId} />
        </div>
        <div css={contentEditor}>
          <Suspense fallback={<LoadingSpinner />}>
            <Router primary={false} component={Fragment}>
              <CodeEditor path="/edit" fileId={fileId} />
              <TableView path="/" fileId={fileId} />
            </Router>
          </Suspense>
        </div>
      </div>
    </Fragment>
  );
};

export default LUPage;
