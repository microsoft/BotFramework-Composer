// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, Fragment, useMemo, useCallback, Suspense, useEffect } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { RouteComponentProps, Router } from '@reach/router';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StoreContext } from '../../store';
import {
  ContentHeaderStyle,
  ContentStyle,
  flexContent,
  actionButton,
  contentEditor,
  contentWrapper,
  HeaderText,
  pageRoot,
} from '../language-understanding/styles';
import { navigateTo } from '../../utils';
import { TestController } from '../../components/TestController';
import { DialogTree } from '../../components/DialogTree';

import TableView from './table-view';
import { ToolBar } from './../../components/ToolBar/index';
const CodeEditor = React.lazy(() => import('./code-editor'));

interface LGPageProps extends RouteComponentProps<{}> {
  dialogId?: string;
}

const LGPage: React.FC<LGPageProps> = (props) => {
  const { state } = useContext(StoreContext);
  const { dialogs, projectId } = state;

  const path = props.location?.pathname ?? '';
  const { dialogId = '' } = props;
  const edit = /\/edit(\/)?$/.test(path);
  const navLinks = useMemo(() => {
    const newDialogLinks = dialogs.map((dialog) => {
      return {
        id: dialog.id,
        url: dialog.id,
        key: dialog.id,
        name: dialog.displayName,
        ariaLabel: formatMessage('language generation file'),
      };
    });
    const mainDialogIndex = newDialogLinks.findIndex((link) => link.id === 'Main');

    if (mainDialogIndex > -1) {
      const mainDialog = newDialogLinks.splice(mainDialogIndex, 1)[0];
      newDialogLinks.splice(0, 0, mainDialog);
    }
    newDialogLinks.splice(0, 0, {
      id: 'common',
      key: 'common',
      name: 'All',
      ariaLabel: formatMessage('all language generation files'),
      url: '',
    });
    return newDialogLinks;
  }, [dialogs]);

  useEffect(() => {
    const activeDialog = dialogs.find(({ id }) => id === dialogId);
    if (!activeDialog && dialogs.length && dialogId !== 'common') {
      navigateTo(`/bot/${projectId}/language-generation/common`);
    }
  }, [dialogId, dialogs, projectId]);

  const onSelect = useCallback(
    (id) => {
      const url = `/bot/${projectId}/language-generation/${id}`;
      navigateTo(url);
    },
    [edit, projectId]
  );

  const onToggleEditMode = useCallback(
    (_e, checked) => {
      let url = `/bot/${projectId}/language-generation/${dialogId}`;
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
      <div css={pageRoot} data-testid="LGPage">
        <div css={contentWrapper}>
          <ToolBar toolbarItems={toolbarItems} />

          <div css={ContentHeaderStyle}>
            <h1 css={HeaderText}>{formatMessage('Bot Responses')}</h1>
            <div css={flexContent}>
              <Toggle
                checked={!!edit}
                className={'toggleEditMode'}
                css={actionButton}
                defaultChecked={false}
                offText={formatMessage('Edit mode')}
                onChange={onToggleEditMode}
                onText={formatMessage('Edit mode')}
              />
            </div>
          </div>
          <div css={ContentStyle} role="main">
            <DialogTree dialogId={dialogId} navLinks={navLinks} onSelect={onSelect} />
            <div css={contentEditor} data-testid="LGEditor">
              <Suspense fallback={<LoadingSpinner />}>
                <Router component={Fragment} primary={false}>
                  <CodeEditor dialogId={dialogId} path="/edit/*" />
                  <TableView dialogId={dialogId} path="/" />
                </Router>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default LGPage;
