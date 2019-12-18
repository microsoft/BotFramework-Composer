// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, Fragment, useMemo, useCallback, Suspense, useEffect } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Nav, INavLinkGroup, INavLink } from 'office-ui-fabric-react/lib/Nav';
import { RouteComponentProps, Router } from '@reach/router';

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

import { Tree } from './../../components/Tree';
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
  const path = props.location?.pathname ?? '';
  const { fileId = 'common' } = props;
  const edit = /edit(\/)*$/.test(path);
  const file = lgFiles.find(({ id }) => id === 'common');

  const navLinks = useMemo<INavLinkGroup[]>(() => {
    const subLinks = dialogs.reduce<INavLink>((result, file) => {
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
    }, {} as INavLink);

    return [
      {
        links: [
          {
            id: 'common',
            key: 'common',
            name: 'All',
            url: '',
            isExpanded: true,
            links: [subLinks],
          },
        ],
      },
    ];
  }, [dialogs]);

  const onSelect = useCallback(
    id => {
      let url = `/language-generation/${id}`;
      if (edit) url += `/edit`;
      navigateTo(url);
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
                selectedKey={fileId}
                groups={navLinks}
                className={'dialogNavTree'}
                data-testid={'dialogNavTree'}
              />
            </div>
          </Tree>
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
