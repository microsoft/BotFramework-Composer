// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useMemo, useState } from 'react';
import AdaptiveForm, { ObjectField } from '@bfc/adaptive-form';
import { FieldProps, useShellApi, JSONSchema7, JSONSchema7Definition } from '@bfc/extension';

import { schema } from './schema';
import { uiOptions } from './uiOptions';
import DialogSchemaContext from './DialogSchemaContext';

export const schemaUrl =
  'https://raw.githubusercontent.com/microsoft/botframework-sdk/master/schemas/component/component.schema';

const getDefinitions = (expressions: JSONSchema7[] = [], dialogSchema: JSONSchema7) =>
  expressions.reduce((acc: { [key: string]: JSONSchema7Definition }, schema: any) => {
    const defName = (schema?.$ref || '').replace('#/definitions/', '');
    const defSchema = dialogSchema?.definitions?.[defName] as JSONSchema7;

    if (!defSchema || typeof defSchema !== 'object' || acc[defName]) {
      return acc;
    }

    const nestedRefs = getDefinitions(defSchema.oneOf as any, dialogSchema);

    return { ...acc, ...nestedRefs, [defName]: defSchema };
  }, {});

const getDefaultDialogSchema = (title: string) => ({
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

const cache = {};

export const AdaptiveDialogField: React.FC<FieldProps> = (props) => {
  const { dialogs, dialogSchemas, dialogId, shellApi } = useShellApi();
  const { updateDialogSchema } = shellApi;

  const { displayName } = dialogs.find(({ id }) => id === dialogId) || {};
  const { content } = dialogSchemas.find(({ id }) => id === dialogId) || {};

  const [dialogSchema, setDialogSchema] = useState(cache[schemaUrl]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async function () {
      if (!dialogSchema) {
        try {
          const res = await fetch(schemaUrl, { signal });
          const data = await res.json();

          setDialogSchema(data);
          cache[schemaUrl] = data;
        } catch (error) {
          // TODO: error
        }
      }
    })();

    return () => controller.abort();
  }, []);

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
    const definitions = getDefinitions(expressions as JSONSchema7[], dialogSchema);

    const content = {
      ...rest,
      properties: dialogValue,
      $result: { ...value.$result, properties: resultValue },
      ...(Object.keys(definitions).length ? { definitions } : {}),
    };
    updateDialogSchema({ content, id: dialogId });
  };

  return (
    <React.Fragment>
      <ObjectField {...props} />
      <DialogSchemaContext.Provider value={{ schema: dialogSchema }}>
        <AdaptiveForm
          formData={formValue}
          schema={schema as JSONSchema7}
          uiOptions={uiOptions}
          onChange={handleChange}
        />
      </DialogSchemaContext.Provider>
    </React.Fragment>
  );
};
