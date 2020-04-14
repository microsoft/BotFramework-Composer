// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, Fragment, useMemo, Suspense, useCallback, useEffect } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { RouteComponentProps, Router } from '@reach/router';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { StoreContext } from '../../store';
import { projectContainer } from '../design/styles';
import { navigateTo } from '../../utils';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ToolBar } from '../../components/ToolBar/index';
import { TestController } from '../../components/TestController';
import { NavLinks } from '../../components/NavLinks';
import { dialogItemSelected, dialogItemNotSelected } from '../../components/NavLinks/styles';

import TableView from './table-view';
import { ContentHeaderStyle, ContentStyle, flexContent, actionButton, contentEditor, HeaderText } from './styles';
const CodeEditor = React.lazy(() => import('./code-editor'));

interface LUPageProps extends RouteComponentProps<{}> {
  dialogId?: string;
  path: string;
}

const LUPage: React.FC<LUPageProps> = props => {
  const { state } = useContext(StoreContext);
  const { dialogs, projectId } = state;
  const path = props.location?.pathname ?? '';
  const { dialogId = '' } = props;
  const edit = /\/edit(\/)?$/.test(path);
  const isRoot = dialogId === 'all';

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
    const activeDialog = dialogs.find(({ id }) => id === dialogId);
    if (!activeDialog && dialogId !== 'all' && dialogs.length) {
      navigateTo(`/bot/${projectId}/language-understanding/all`);
    }
  }, [dialogId, dialogs, projectId]);

  const onSelect = useCallback(
    id => {
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
    <Fragment>
      <ToolBar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage('User Input')}</h1>
        <div css={flexContent}>
          {(!isRoot || edit) && (
            <Toggle
              className={'toggleEditMode'}
              css={actionButton}
              onText={formatMessage('Edit mode')}
              offText={formatMessage('Edit mode')}
              defaultChecked={false}
              checked={!!edit}
              onChange={onToggleEditMode}
            />
          )}
        </div>
      </div>
      <div css={ContentStyle} data-testid="LUEditor">
        <div css={projectContainer}>
          <DefaultButton
            key={'_all'}
            onClick={() => {
              onSelect('all');
            }}
            styles={isRoot ? dialogItemSelected : dialogItemNotSelected}
            text={formatMessage('All')}
            ariaLabel={formatMessage('all language understanding files')}
            ariaHidden={false}
          />
          <NavLinks navLinks={navLinks} onSelect={onSelect} fileId={dialogId} />
        </div>
        <div css={contentEditor}>
          <Suspense fallback={<LoadingSpinner />}>
            <Router primary={false} component={Fragment}>
              <CodeEditor path="/edit" dialogId={dialogId} />
              <TableView path="/" dialogId={dialogId} />
            </Router>
          </Suspense>
        </div>
      </div>
    </Fragment>
  );
};

export default LUPage;
