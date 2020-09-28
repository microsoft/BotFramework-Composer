// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import mapValues from 'lodash/mapValues';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { MenuUISchema } from '../types';

export function useMenuConfig(): MenuUISchema {
  const { plugins, shellData } = useContext(EditorExtensionContext);
  const uiSchema = plugins.uiSchema || {};
  const sdkSchema = shellData.schemas?.sdk;
  const sdkDefinitions = sdkSchema?.content?.definitions || {};

  return useMemo(() => {
    const menuSchema = mapValues(uiSchema, 'menu') as MenuUISchema;
    const implementedMenuSchema = Object.entries(menuSchema).reduce((result, [$kind, menuOpt]) => {
      // Filter out those $kinds implemented in both sdk.schema and uischema
      if (sdkDefinitions[$kind] && menuOpt) {
        result[$kind] = menuOpt;
      }
      return result;
    }, {} as MenuUISchema);
    return implementedMenuSchema;
  }, [plugins.uiSchema, sdkSchema]);
}
