// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, Fragment, useEffect, useState, useMemo, Suspense } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { StoreContext } from '../../store';
import { projectContainer } from '../design/styles';
import { navigateTo } from '../../utils';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ToolBar } from '../../components/ToolBar/index';
import { TestController } from '../../TestController';

import TableView from './table-view';
import { ContentHeaderStyle, ContentStyle, flexContent, actionButton, contentEditor, dialogItem } from './styles';

const CodeEditor = React.lazy(() => import('./code-editor'));

interface DefineConversationProps {
  path: string;
}

const LUPage: React.FC<DefineConversationProps> = props => {
  const { state, actions } = useContext(StoreContext);
  const { luFiles, dialogs } = state;
  const [editMode, setEditMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedDialogItem, setSelectedDialogItem] = useState('_all');
  const subPath = props['*'];
  const isRoot = subPath === '';
  const activeDialog = dialogs.find(item => item.id === subPath);

  const luFile = luFiles.length && activeDialog ? luFiles.find(luFile => luFile.id === activeDialog.id) : null;

  const navLinks = useMemo(() => {
    const newDialogLinks = dialogs.map(dialog => {
      return { id: dialog.id, url: dialog.id, key: dialog.id, name: dialog.displayName };
    });
    newDialogLinks.splice(0, 0, {
      id: '_all',
      key: '_all',
      name: 'All',
      url: '_all',
    });
    return newDialogLinks;
  }, [dialogs]);

  useEffect(() => {
    // root view merge all lu file into one list, we can't edit multi file.
    if (isRoot) {
      setEditMode(false);
    }

    // fall back to the all-up page if we don't have an active dialog
    if (!isRoot && !activeDialog && dialogs.length) {
      navigateTo('/language-understanding');
    }
  }, [subPath, dialogs]);

  useEffect(() => {
    setErrorMsg('');
  }, [luFile]);

  function onSelect(id) {
    if (id === '_all') {
      navigateTo('/language-understanding');
    } else {
      navigateTo(`/language-understanding/${id}`);
    }
    setSelectedDialogItem(id);
    setEditMode(false);
  }

  async function onChange(newContent: string) {
    const id = activeDialog ? activeDialog.id : undefined;
    const payload = {
      id: id, // current opened lu file
      content: newContent,
    };
    try {
      await actions.updateLuFile(payload);
    } catch (error) {
      setErrorMsg(error.message);
    }
  }

  // #TODO: get line number from lu parser, then deep link to code editor this
  // Line
  function onTableViewClickEdit({ fileId = '' }) {
    navigateTo(`language-understanding/${fileId}`);
    setEditMode(true);
  }

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
        <div>{formatMessage('User Input')}</div>
        <div css={flexContent}>
          <Toggle
            className={'toggleEditMode'}
            css={actionButton}
            onText={formatMessage('Edit mode')}
            offText={formatMessage('Edit mode')}
            checked={editMode}
            disabled={isRoot && editMode === false}
            onChange={() => setEditMode(!editMode)}
          />
        </div>
      </div>
      <div css={ContentStyle} data-testid="LUEditor">
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
        <div css={contentEditor}>
          {editMode ? (
            <Suspense fallback={<LoadingSpinner />}>
              <CodeEditor file={luFile} onChange={onChange} errorMsg={errorMsg} />
            </Suspense>
          ) : (
            <TableView activeDialog={activeDialog} onClickEdit={onTableViewClickEdit} />
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default LUPage;
