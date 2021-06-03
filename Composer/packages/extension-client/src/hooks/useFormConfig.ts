// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import mapValues from 'lodash/mapValues';
import get from 'lodash/get';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { FormUISchema } from '../types';

export function useFormConfig() {
  const { plugins, shellData } = useContext(EditorExtensionContext);
  const sdkSchema = get(shellData, 'schemas.sdk.content', {});

  const isTrigger = ($kind): boolean => {
    const schemaRole = get(sdkSchema, ['definitions', $kind, '$role']);
    const ITriggerPattern = 'implements(Microsoft.ITrigger)';

    if (typeof schemaRole === 'string') return schemaRole.indexOf(ITriggerPattern) > -1;
    if (Array.isArray(schemaRole)) return (schemaRole as string[]).some((role) => role.indexOf(ITriggerPattern) > -1);

    return false;
  };

  const formConfig: FormUISchema = useMemo(() => {
    const result = mapValues(plugins.uiSchema, 'form');

    // Hide 'actions' in all trigger types.
    Object.entries(result)
      .filter(([$kind, options]) => options && isTrigger($kind))
      .forEach(([, options]) => {
        if (!options.hidden) {
          options.hidden = ['actions'];
        } else if (Array.isArray(options.hidden) && !options.hidden.some((x) => x === 'actions')) {
          options.hidden.push('actions');
        }
      });

    // Add default options for those $kind without uischema.
    const allSDKKinds = Object.keys(get(sdkSchema, 'definitions', {}));
    const kindsWithoutFormOptions = allSDKKinds.filter(($kind) => !result[$kind]);
    const triggersWithoutFormOptions = kindsWithoutFormOptions.filter(($kind) => isTrigger($kind));
    triggersWithoutFormOptions.forEach(($kind) => {
      result[$kind] = { hidden: ['actions'] };
    });

    return result;
  }, [plugins.uiSchema, sdkSchema]);
  return formConfig;
}
