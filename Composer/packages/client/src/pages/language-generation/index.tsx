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
import { actionButton } from '../language-understanding/styles';
import { navigateTo } from '../../utils';
import { TestController } from '../../components/TestController';
import { INavTreeItem } from '../../components/NavTree';
import { Page } from '../../components/Page';

import TableView from './table-view';
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

  const navLinks: INavTreeItem[] = useMemo(() => {
    const newDialogLinks: INavTreeItem[] = dialogs.map((dialog) => {
      return {
        id: dialog.id,
        name: dialog.displayName,
        ariaLabel: formatMessage('language generation file'),
        url: `/bot/${projectId}/language-generation/${dialog.id}`,
      };
    });
    const mainDialogIndex = newDialogLinks.findIndex((link) => link.id === 'Main');

    if (mainDialogIndex > -1) {
      const mainDialog = newDialogLinks.splice(mainDialogIndex, 1)[0];
      newDialogLinks.splice(0, 0, mainDialog);
    }
    newDialogLinks.splice(0, 0, {
      id: 'common',
      name: 'All',
      ariaLabel: formatMessage('all language generation files'),
      url: `/bot/${projectId}/language-generation/common`,
    });
    return newDialogLinks;
  }, [dialogs]);

  useEffect(() => {
    const activeDialog = dialogs.find(({ id }) => id === dialogId);
    if (!activeDialog && dialogs.length && dialogId !== 'common') {
      navigateTo(`/bot/${projectId}/language-generation/common`);
    }
  }, [dialogId, dialogs, projectId]);

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

  const onRenderHeaderContent = () => {
    return (
      <Toggle
        className={'toggleEditMode'}
        css={actionButton}
        onText={formatMessage('Edit mode')}
        offText={formatMessage('Edit mode')}
        defaultChecked={false}
        checked={!!edit}
        onChange={onToggleEditMode}
      />
    );
  };

  return (
    <Page
      title={formatMessage('Bot Responses')}
      toolbarItems={toolbarItems}
      navLinks={navLinks}
      onRenderHeaderContent={onRenderHeaderContent}
      data-testid="LGPage"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Router primary={false} component={Fragment}>
          <CodeEditor path="/edit/*" dialogId={dialogId} />
          <TableView path="/" dialogId={dialogId} />
        </Router>
      </Suspense>
    </Page>
  );
};

export default LGPage;
