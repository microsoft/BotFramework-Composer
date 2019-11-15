// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, Fragment, useEffect, useState, useMemo, Suspense } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Nav, INavLinkGroup, INavLink } from 'office-ui-fabric-react/lib/Nav';
import { LGTemplate } from 'botbuilder-lg';
import { RouteComponentProps } from '@reach/router';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StoreContext } from '../../store';
import {
  ContentHeaderStyle,
  ContentStyle,
  flexContent,
  actionButton,
  contentEditor,
} from '../language-understanding/styles';
import { projectContainer, projectTree, projectWrapper } from '../design/styles';
import { navigateTo } from '../../utils';
import * as lgUtil from '../../utils/lgUtil';

import { Tree } from './../../components/Tree';
import TableView from './table-view';
import { ToolBar } from './../../components/ToolBar/index';
import { TestController } from './../../TestController';

const CodeEditor = React.lazy(() => import('./code-editor'));

const LGPage: React.FC<RouteComponentProps> = props => {
  const { state } = useContext(StoreContext);
  const { lgFiles, dialogs } = state;
  const [editMode, setEditMode] = useState(false);
  const [fileValid, setFileValid] = useState(true);
  const [inlineTemplate, setInlineTemplate] = useState<null | LGTemplate>(null);

  const subPath = props['*'];
  const isRoot = subPath === '';
  const activeDialog = dialogs.find(item => item.id === subPath);

  // for now, one bot only have one lg file by default. all dialog share one lg
  // file.
  const lgFile = lgFiles.length ? lgFiles[0] : null;

  const navLinks = useMemo<INavLinkGroup[]>(() => {
    const subLinks = dialogs.reduce<INavLink>(
      (result, file) => {
        const item = {
          id: file.id,
          key: file.id,
          name: file.displayName,
          url: file.id,
        };

        if (file.isRoot) {
          result = {
            ...result,
            ...item,
            isExpanded: true,
          };
        } else {
          result.links = result.links || [];
          result.links.push(item);
        }
        return result;
      },
      {} as INavLink
    );

    return [
      {
        links: [
          {
            id: '_all',
            key: '_all',
            name: 'All',
            url: '',
            isExpanded: true,
            links: [subLinks],
          },
        ],
      },
    ];
  }, [dialogs]);

  useEffect(() => {
    // dialog lg templates is part of commong.lg. By restricting edit in root view, user would aware that the changes they made may affect other dialogs.
    if (!isRoot) {
      setEditMode(false);
    }

    //  fall back to the all-up page if we don't have an active dialog
    if (!isRoot && !activeDialog && dialogs.length) {
      navigateTo('/language-generation');
    }
  }, [subPath, dialogs]);

  useEffect(() => {
    const errorFiles = lgFiles.filter(file => {
      return lgUtil.isValid(file.diagnostics) === false;
    });
    const hasError = errorFiles.length !== 0;
    setFileValid(hasError === false);
    if (hasError) {
      setEditMode(true);
    }
  }, [lgFiles]);

  function onSelect(id) {
    if (id === '_all') {
      navigateTo('/language-generation');
    } else {
      navigateTo(`language-generation/${id}`);
    }
  }

  function onToggleEditMode() {
    setEditMode(!editMode);
    setInlineTemplate(null);
  }

  // #TODO: get line number from lg parser, then deep link to code editor this
  // Line
  function onTableViewClickEdit(template: LGTemplate) {
    setInlineTemplate(template);
    navigateTo(`/language-generation`);
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
        <div>{formatMessage('Bot Responses')}</div>
        <div css={flexContent}>
          <Toggle
            className={'toggleEditMode'}
            css={actionButton}
            onText={formatMessage('Edit mode')}
            offText={formatMessage('Edit mode')}
            checked={editMode}
            disabled={(!isRoot && editMode === false) || fileValid === false}
            onChange={onToggleEditMode}
          />
        </div>
      </div>
      <div css={ContentStyle} data-testid="LGEditor">
        <div css={projectContainer}>
          <Tree variant="large" css={projectTree}>
            <div css={projectWrapper}>
              <Nav
                onLinkClick={(ev, item) => {
                  if (ev && item) {
                    onSelect(item.id);
                    ev.preventDefault();
                  }
                }}
                styles={{
                  root: {
                    /* override dulplicate selected mark bellow All*/
                    selectors: {
                      'ul>li>ul button.ms-Nav-chevronButton:after': {
                        borderLeft: 'none',
                      },
                    },
                  },
                  chevronButton: {
                    backgroundColor: 'transparent',
                  },
                }}
                selectedKey={isRoot ? '_all' : subPath}
                groups={navLinks}
                className={'dialogNavTree'}
                data-testid={'dialogNavTree'}
              />
            </div>
          </Tree>
        </div>
        {lgFile && (
          <div css={contentEditor}>
            {editMode ? (
              <Suspense fallback={<LoadingSpinner />}>
                <CodeEditor file={lgFile} template={inlineTemplate} />
              </Suspense>
            ) : (
              <TableView file={lgFile} activeDialog={activeDialog} onClickEdit={onTableViewClickEdit} />
            )}
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default LGPage;
