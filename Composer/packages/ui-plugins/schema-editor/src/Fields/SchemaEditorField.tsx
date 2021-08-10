// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import AdaptiveForm from '@bfc/adaptive-form';
import { useShellApi, JSONSchema7 } from '@bfc/extension-client';

import { getDefaultDialogSchema } from '../utils/getDefaultDialogSchema';
import { getDefinitions } from '../utils/getDefinitions';
import { uiOptions } from '../uiOptions';
import { schema, valueTypeDefinitions } from '../schema';
import { SCHEMA_URI } from '../contants';

const styles = {
  container: css`
    margin: 0 -18px;
  `,
};

export const SchemaEditorField: React.FC = () => {
  const { dialogs, dialogSchemas, dialogId, shellApi } = useShellApi();
  const { updateDialogSchema } = shellApi;

  const { displayName } = dialogs.find(({ id }) => id === dialogId) || {};
  const { content } = dialogSchemas.find(({ id }) => id === dialogId) || {};

  const value = useMemo(
    () => (typeof content === 'object' ? content : getDefaultDialogSchema(SCHEMA_URI, displayName || dialogId)),
    [content]
  );

  const formValue = useMemo(
    () => ({
      dialogValue: value?.properties || {},
      resultValue: value?.$result?.properties || {},
    }),
    [value?.properties, value?.$result?.properties]
  );

  const handleChange = ({ dialogValue = {}, resultValue = {} }) => {
    const { definitions: _, ...rest } = value;
    const expressions = [...Object.values(dialogValue), ...Object.values(resultValue)];
    const definitions = getDefinitions(expressions as JSONSchema7[], valueTypeDefinitions);

    const content = {
      $schema: SCHEMA_URI,
      ...rest,
      properties: dialogValue,
      $result: { ...value.$result, properties: resultValue },
      ...(Object.keys(definitions).length ? { definitions } : {}),
    };
    updateDialogSchema({ content, id: dialogId });
  };

  return (
    <div css={styles.container}>
      <AdaptiveForm formData={formValue} schema={schema()} uiOptions={uiOptions} onChange={handleChange} />
    </div>
  );
};
