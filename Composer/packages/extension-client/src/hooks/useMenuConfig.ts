// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import mapValues from 'lodash/mapValues';
import { DisabledMenuActions } from '@botframework-composer/types';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { MenuUISchema } from '../types';

export function useMenuConfig(): { menuSchema: MenuUISchema; forceDisabledActions: DisabledMenuActions[] } {
  const { plugins, shellData } = useContext(EditorExtensionContext);
  const uiSchema = plugins.uiSchema || {};
  const sdkSchema = shellData.schemas?.sdk;
  const sdkDefinitions = sdkSchema?.content?.definitions || {};
  const forceDisabledActions = shellData.forceDisabledActions;

  return useMemo(() => {
    const menuSchema = mapValues(uiSchema, 'menu') as MenuUISchema;
    const implementedMenuSchema = {} as MenuUISchema;

    // Keep those $kinds implemented in both sdk.schema and uischema
    Object.entries(menuSchema).forEach(([$kind, menuOpt]) => {
      if (menuOpt && sdkDefinitions[$kind]) {
        implementedMenuSchema[$kind] = menuOpt;
      }
    });

    return { menuSchema: implementedMenuSchema, forceDisabledActions };
  }, [plugins.uiSchema, sdkSchema]);
}
