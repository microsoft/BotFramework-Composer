// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import { JsonEditor } from '@bfc/code-editor';
import { FieldLabel, schemaField, ObjectField } from '@bfc/adaptive-form';
import { FieldProps, useShellApi } from '@bfc/extension';
import formatMessage from 'format-message';

const getDefaultDialogSchema = (title: string) => ({
  $schema: 'https://raw.githubusercontent.com/microsoft/botframework-sdk/master/schemas/component/component.schema',
  $role: 'implements(Microsoft.IDialog)',
  title,
  type: 'object',
  properties: {},
  $resultValue: {
    type: 'object',
    properties: {},
  },
});

export const AdaptiveDialogField: React.FC<FieldProps> = (props) => {
  const { dialogs, dialogSchemaFiles, dialogId, shellApi } = useShellApi();
  const { updateDialogSchema } = shellApi;
  const { displayName } = dialogs.find(({ id }) => id === dialogId) || {};
  const { content } = dialogSchemaFiles.find(({ id }) => id === dialogId) || {};

  const value = useMemo(
    () => (typeof content === 'object' ? content : getDefaultDialogSchema(displayName || dialogId)),
    [content]
  );

  const handleChange = (content) => {
    updateDialogSchema({ content, id: dialogId });
  };

  const handleValueChange = (properties) => {
    handleChange({ ...value, properties });
  };

  const handleResultValueChange = (properties) => {
    handleChange({ ...value, $resultValue: { ...value.$resultValue, properties } });
  };

  return (
    <React.Fragment>
      <ObjectField {...props} />
      <div css={schemaField.container(0)}>
        <FieldLabel label={formatMessage('Dialog value')} />
        <JsonEditor height={150} value={value?.properties ?? {}} onChange={handleValueChange} />
      </div>
      <div css={schemaField.container(0)}>
        <FieldLabel label={formatMessage('Dialog result value')} />
        <JsonEditor height={150} value={value?.$resultValue?.properties ?? {}} onChange={handleResultValueChange} />
      </div>
    </React.Fragment>
  );
};
