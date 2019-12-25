// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useState, Fragment, useMemo, useCallback, Suspense } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { INavLinkGroup, INavLink } from 'office-ui-fabric-react/lib/Nav';
import { RouteComponentProps, Router } from '@reach/router';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StoreContext } from '../../store';
import {
  ContentHeaderStyle,
  ContentStyle,
  flexContent,
  actionButton,
  contentEditor,
  dialogItem,
} from '../language-understanding/styles';
import { projectContainer } from '../design/styles';
import { navigateTo } from '../../utils';

import TableView from './table-view';
import { ToolBar } from './../../components/ToolBar/index';
import { TestController } from './../../TestController';

const CodeEditor = React.lazy(() => import('./code-editor'));

interface LGPageProps extends RouteComponentProps<{}> {
  fileId?: string;
}

const LGPage: React.FC<LGPageProps> = props => {
  const { state } = useContext(StoreContext);
  const { lgFiles, dialogs } = state;
  const [selectedDialogItem, setSelectedDialogItem] = useState('common');
  const path = props.location?.pathname ?? '';
  const { fileId = 'common' } = props;
  const edit = /edit(\/)*$/.test(path);
  const file = lgFiles.find(({ id }) => id === 'common');

  const navLinks = useMemo(() => {
    const newDialogLinks = dialogs.map(dialog => {
      return { id: dialog.id, url: dialog.id, key: dialog.id, name: dialog.displayName };
    });
    newDialogLinks.splice(0, 0, {
      id: 'common',
      key: 'common',
      name: 'All',
      url: '',
    });
    return newDialogLinks;
  }, [dialogs]);

  const onSelect = useCallback(
    id => {
      let url = `/language-generation/${id}`;
      if (edit) url += `/edit`;
      navigateTo(url);
      setSelectedDialogItem(id);
    },
    [edit]
  );

  const onToggleEditMode = useCallback(
    (_e, checked) => {
      let url = `/language-generation/${fileId}`;
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
        <div>{formatMessage('Bot Responses')}</div>
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
          {navLinks.map(dialog => {
            return (
              <div
                css={dialogItem(selectedDialogItem === dialog.id)}
                key={dialog.id}
                onClick={() => {
                  onSelect(dialog.id);
                }}
              >
                {dialog.name}
              </div>
            );
          })}
        </div>
        {file && (
          <div css={contentEditor}>
            <Suspense fallback={<LoadingSpinner />}>
              <Router primary={false} component={Fragment}>
                <CodeEditor path="/edit" fileId={fileId} />
                <TableView path="/" fileId={fileId} />
              </Router>
            </Suspense>
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default LGPage;
