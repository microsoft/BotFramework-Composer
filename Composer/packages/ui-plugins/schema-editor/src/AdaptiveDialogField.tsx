// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { JsonEditor } from '@bfc/code-editor';
import { FieldLabel, schemaField, ObjectField } from '@bfc/adaptive-form';
import { FieldProps, useShellApi } from '@bfc/extension';
import formatMessage from 'format-message';

const getDefaultDialogSchema = (title: string, description = '') => ({
  $schema: 'https://raw.githubusercontent.com/microsoft/botframework-sdk/master/schemas/component/component.schema',
  $role: 'implements(Microsoft.IDialog)',
  title,
  description,
  type: 'object',
  properties: {},
});

export const AdaptiveDialogField: React.FC<FieldProps> = (props) => {
  const { dialogs, dialogSchemaFiles, dialogId, shellApi } = useShellApi();
  const { updateDialogSchema } = shellApi;
  const { content: dialogContent, displayName } = dialogs.find(({ id }) => id === dialogId) || {};
  const {
    $designer: { description },
  } = dialogContent;
  const { content } = dialogSchemaFiles.find(({ id }) => id === dialogId) || {};

  const handleChange = (content) => {
    updateDialogSchema({ content, id: dialogId });
  };

  return (
    <React.Fragment>
      <ObjectField {...props} />
      <div css={schemaField.container(0)}>
        <FieldLabel label={formatMessage('Dialog schema')} />
        <JsonEditor
          height={300}
          value={typeof content === 'object' ? content : getDefaultDialogSchema(displayName || dialogId, description)}
          onChange={handleChange}
        />
      </div>
    </React.Fragment>
  );
};
