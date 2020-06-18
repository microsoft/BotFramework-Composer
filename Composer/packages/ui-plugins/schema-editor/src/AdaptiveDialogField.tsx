// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { JsonEditor } from '@bfc/code-editor';
import { FieldLabel, schemaField, ObjectField } from '@bfc/adaptive-form';
import { FieldProps, useShellApi } from '@bfc/extension';
import formatMessage from 'format-message';

const DEFAULT_DIALOG_SCHEMA = (title: string, description = '') => ({
  $schema: 'https://raw.githubusercontent.com/microsoft/botframework-sdk/master/schemas/component/component.schema',
  $role: 'implements(Microsoft.IDialog)',
  title,
  description,
  type: 'object',
  properties: {},
});

export const AdaptiveDialogField: React.FC<FieldProps> = (props) => {
  const { dialogs, dialogId, shellApi } = useShellApi();
  const { updateDialogSchema } = shellApi;
  const { content, dialogSchema, displayName } = dialogs.find(({ id }) => id === dialogId) || {};
  const {
    $designer: { description },
  } = content;

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
          value={
            typeof dialogSchema?.content === 'object'
              ? dialogSchema.content
              : DEFAULT_DIALOG_SCHEMA(displayName || dialogId, description)
          }
          onChange={handleChange}
        />
      </div>
    </React.Fragment>
  );
};
