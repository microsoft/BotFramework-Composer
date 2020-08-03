// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import AdaptiveForm from '@bfc/adaptive-form';
import { useShellApi, JSONSchema7, JSONSchema7Definition } from '@bfc/extension';

import { schema } from './schema';
import { uiOptions } from './uiOptions';
import { resultTypeDefinitions, valueTypeDefinitions } from './schema';

const schemaUrl =
  'https://raw.githubusercontent.com/microsoft/botframework-sdk/master/schemas/component/component.schema';

export const getDefinitions = (expressions: JSONSchema7[] = [], definitions: { [key: string]: any }) =>
  expressions.reduce((acc: { [key: string]: JSONSchema7Definition }, schema: any) => {
    const defName = (schema?.$ref || '').replace('#/definitions/', '');
    const defSchema = definitions?.[defName] as JSONSchema7;

    if (!defSchema || typeof defSchema !== 'object' || acc[defName]) {
      return acc;
    }

    const nestedRefs = getDefinitions(defSchema.oneOf as any, definitions);

    return { ...acc, ...nestedRefs, [defName]: defSchema };
  }, {});

export const getDefaultDialogSchema = (title: string) => ({
  $schema: schemaUrl,
  $role: 'implements(Microsoft.IDialog)',
  title,
  type: 'object',
  properties: {},
  $result: {
    type: 'object',
    properties: {},
  },
});

export const SchemaEditorField: React.FC = () => {
  const { dialogs, dialogSchemas, dialogId, shellApi } = useShellApi();
  const { updateDialogSchema } = shellApi;

  const { displayName } = dialogs.find(({ id }) => id === dialogId) || {};
  const { content } = dialogSchemas.find(({ id }) => id === dialogId) || {};

  const value = useMemo(
    () => (typeof content === 'object' ? content : getDefaultDialogSchema(displayName || dialogId)),
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
    const definitions = getDefinitions(expressions as JSONSchema7[], {
      ...resultTypeDefinitions,
      ...valueTypeDefinitions,
    });

    const content = {
      ...rest,
      properties: dialogValue,
      $result: { ...value.$result, properties: resultValue },
      ...(Object.keys(definitions).length ? { definitions } : {}),
    };
    updateDialogSchema({ content, id: dialogId });
  };

  return <AdaptiveForm formData={formValue} schema={schema()} uiOptions={uiOptions} onChange={handleChange} />;
};
