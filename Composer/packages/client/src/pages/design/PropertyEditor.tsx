// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useMemo } from 'react';
import AdaptiveForm from '@bfc/adaptive-form';
import Extension from '@bfc/extension';
import get from 'lodash/get';
import { ShellData } from '@bfc/shared';
import formatMessage from 'format-message';

import { StoreContext } from '../../store';
import { getDialogData } from '../../utils';
import { useShellApi } from '../../useShellApi';
import plugins from '../../extension-container/plugins';

import { formEditor } from './styles';

const PropertyEditor: React.FC = () => {
  const shellApi = useShellApi('FormEditor');
  const { state } = useContext(StoreContext);
  const { locale, botName, projectId, dialogs, focusPath, schemas, lgFiles, luFiles, designPageLocation } = state;
  const { dialogId, selected, focused, promptTab } = designPageLocation;

  const dialogsMap = useMemo(() => {
    return dialogs.reduce((result, dialog) => {
      result[dialog.id] = dialog.content;
      return result;
    }, {});
  }, [dialogs]);

  const currentDialog = dialogs.find(d => d.id === dialogId);
  const formData = getDialogData(dialogsMap, dialogId, focused || selected || '');

  // @ts-ignore
  const shellData: ShellData = currentDialog
    ? {
        data: formData,
        locale,
        botName,
        projectId,
        dialogs,
        dialogId,
        focusPath,
        schemas,
        lgFiles,
        luFiles,
        currentDialog,
        designerId: get(formData, '$designer.id'),
        focusedEvent: selected,
        focusedActions: focused ? [focused] : [],
        focusedSteps: focused ? [focused] : selected ? [selected] : [],
        focusedTab: promptTab,
        clipboardActions: state.clipboardActions,
      }
    : {};

  return (
    <div css={formEditor} aria-label={formatMessage('form editor')}>
      <Extension shell={shellApi as any} shellData={shellData}>
        <AdaptiveForm plugins={plugins} formData={formData} schema={schemas.sdk?.content} />
      </Extension>
    </div>
  );
};

export { PropertyEditor };
