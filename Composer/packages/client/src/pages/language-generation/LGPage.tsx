// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, useMemo, useCallback, Suspense, useEffect } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { RouteComponentProps, Router } from '@reach/router';
import { useRecoilValue } from 'recoil';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { actionButton } from '../language-understanding/styles';
import { navigateTo } from '../../utils/navigation';
import { INavTreeItem } from '../../components/NavTree';
import { Page } from '../../components/Page';
import { validateDialogSelectorFamily } from '../../recoilModel';

import TableView from './table-view';
const CodeEditor = React.lazy(() => import('./code-editor'));

interface LGPageProps {
  dialogId: string;
  projectId: string;
}

const LGPage: React.FC<RouteComponentProps<LGPageProps>> = (props: RouteComponentProps<LGPageProps>) => {
  const { dialogId = '', projectId = '' } = props;
  const dialogs = useRecoilValue(validateDialogSelectorFamily(projectId));

  const path = props.location?.pathname ?? '';

  const edit = /\/edit(\/)?$/.test(path);

  const navLinks: INavTreeItem[] = useMemo(() => {
    const newDialogLinks: INavTreeItem[] = dialogs.map((dialog) => {
      let url = `/bot/${projectId}/language-generation/${dialog.id}`;
      if (edit) {
        url += `/edit`;
      }
      return {
        id: dialog.id,
        name: dialog.displayName,
        ariaLabel: formatMessage('language generation file'),
        url,
      };
    });
    const mainDialogIndex = newDialogLinks.findIndex((link) => link.id === 'Main');

    if (mainDialogIndex > -1) {
      const mainDialog = newDialogLinks.splice(mainDialogIndex, 1)[0];
      newDialogLinks.splice(0, 0, mainDialog);
    }
    let commonUrl = `/bot/${projectId}/language-generation/common`;
    if (edit) {
      commonUrl += '/edit';
    }

    newDialogLinks.splice(0, 0, {
      id: 'common',
      name: formatMessage('All'),
      ariaLabel: formatMessage('all language generation files'),
      url: commonUrl,
    });
    return newDialogLinks;
  }, [dialogs, edit]);

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

  const onRenderHeaderContent = () => {
    return (
      <Toggle
        checked={!!edit}
        className={'toggleEditMode'}
        css={actionButton}
        offText={formatMessage('Edit mode')}
        onChange={onToggleEditMode}
        onText={formatMessage('Edit mode')}
      />
    );
  };

  return (
    <Page
      data-testid="LGPage"
      mainRegionName={formatMessage('LG editor')}
      navLinks={navLinks}
      navRegionName={formatMessage('LG Navigation Pane')}
      title={formatMessage('Bot Responses')}
      toolbarItems={}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Router component={Fragment} primary={false}>
          <CodeEditor dialogId={dialogId} path="/edit/*" projectId={projectId} />
          <TableView dialogId={dialogId} path="/" projectId={projectId} />
        </Router>
      </Suspense>
    </Page>
  );
};

export default LGPage;
