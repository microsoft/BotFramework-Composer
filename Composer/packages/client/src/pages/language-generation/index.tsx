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
  HeaderText,
} from '../language-understanding/styles';
import { projectContainer } from '../design/styles';
import { navigateTo } from '../../utils';
import { NavLinks } from '../../components/NavLinks';

import TableView from './table-view';
import { ToolBar } from './../../components/ToolBar/index';
import { TestController } from './../../TestController';
const CodeEditor = React.lazy(() => import('./code-editor'));

interface LGPageProps extends RouteComponentProps<{}> {
  fileId?: string;
}

const LGPage: React.FC<LGPageProps> = props => {
  const { state } = useContext(StoreContext);
  const { dialogs, projectId } = state;

  const path = props.location?.pathname ?? '';
  const { fileId = '' } = props;
  const edit = /\/edit(\/)?$/.test(path);
  const navLinks = useMemo(() => {
    const newDialogLinks = dialogs.map(dialog => {
      return { id: dialog.id, url: dialog.id, key: dialog.id, name: dialog.displayName };
    });
    const mainDialogIndex = newDialogLinks.findIndex(link => link.id === 'Main');

    if (mainDialogIndex > -1) {
      const mainDialog = newDialogLinks.splice(mainDialogIndex, 1)[0];
      newDialogLinks.splice(0, 0, mainDialog);
    }
    newDialogLinks.splice(0, 0, {
      id: 'common',
      key: 'common',
      name: 'All',
      url: '',
    });
    return newDialogLinks;
  }, [dialogs]);

  useEffect(() => {
    const activeDialog = dialogs.find(({ id }) => id === fileId);
    if (!activeDialog && dialogs.length && fileId !== 'common') {
      navigateTo(`/bot/${projectId}/language-generation/common`);
    }
  }, [fileId, dialogs, projectId]);

  const onSelect = useCallback(
    id => {
      const url = `/bot/${projectId}/language-generation/${id}`;
      navigateTo(url);
    },
    [edit, projectId]
  );

  const onToggleEditMode = useCallback(
    (_e, checked) => {
      let url = `/bot/${projectId}/language-generation/${fileId}`;
      if (checked) url += `/edit`;
      navigateTo(url);
    },
    [fileId, projectId]
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
        <div css={HeaderText}>{formatMessage('Bot Responses')}</div>
        <div css={flexContent}>
          <Toggle
            className={'toggleEditMode'}
            css={actionButton}
            onText={formatMessage('Edit mode')}
            offText={formatMessage('Edit mode')}
            defaultChecked={false}
            checked={!!edit}
            onChange={onToggleEditMode}
          />
        </div>
      </div>
      <div css={ContentStyle} data-testid="LGEditor">
        <div css={projectContainer}>
          <NavLinks navLinks={navLinks} onSelect={onSelect} fileId={fileId} />
        </div>
        <div css={contentEditor}>
          <Suspense fallback={<LoadingSpinner />}>
            <Router primary={false} component={Fragment}>
              <CodeEditor path="/edit/*" fileId={fileId} />
              <TableView path="/" fileId={fileId} />
            </Router>
          </Suspense>
        </div>
      </div>
    </Fragment>
  );
};

export default LGPage;
