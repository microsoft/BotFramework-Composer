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

const useFetch = (url) => {
  const controller = new AbortController();
  const { signal } = controller;
  const [cache, setCache] = useState({});

  useEffect(() => {
    (async function () {
      if (!cache[url]) {
        try {
          const res = await fetch(url, { signal });
          const data = await res.json();

          setCache((cache) => ({ ...cache, [url]: data }));
        } catch (error) {
          if (error.name === 'AbortError') {
          }
        }
      }
    })();

    return () => controller.abort();
  }, [url]);

  return cache[url];
};

export const AdaptiveDialogField: React.FC<FieldProps> = (props) => {
  const { dialogs, dialogSchemaFiles, dialogId, shellApi } = useShellApi();
  const { updateDialogSchema } = shellApi;

  const { displayName } = dialogs.find(({ id }) => id === dialogId) || {};
  const { content } = dialogSchemaFiles.find(({ id }) => id === dialogId) || {};

  const dialogSchema = useFetch(schemaUrl);

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
    const expressions = [...Object.values(dialogSchema), ...Object.values(resultValue)];
    const definitions = getDefinitions(expressions as JSONSchema7[], dialogSchema);

    const content = {
      ...value,
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
          schema={schema as JSONSchema7}
          formData={formValue}
          onChange={handleChange}
          uiOptions={uiOptions}
        />
      </DialogSchemaContext.Provider>
    </React.Fragment>
  );
};
