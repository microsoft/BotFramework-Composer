// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext, useMemo } from 'react';
import mapValues from 'lodash/mapValues';
import { DisabledMenuActions } from '@botframework-composer/types';
import get from 'lodash/get';

import { EditorExtensionContext } from '../EditorExtensionContext';
import { MenuUISchema } from '../types';

export function useMenuConfig(): { menuSchema: MenuUISchema; forceDisabledActions: DisabledMenuActions[] } {
  const { plugins, shellData } = useContext(EditorExtensionContext);
  const uiSchema = plugins.uiSchema || {};
  const sdkSchema = shellData.schemas?.sdk;
  const sdkDefinitions = sdkSchema?.content?.definitions || {};
  const forceDisabledActions = shellData.forceDisabledActions;

  const getFallbackLabel = ($kind): string => get(sdkSchema, `content.definitions["${$kind}"].title`, $kind);

  return useMemo(() => {
    const menuSchema = mapValues(uiSchema, 'menu') as MenuUISchema;
    const implementedMenuSchema = {} as MenuUISchema;

    // Keep those $kinds implemented in both sdk.schema and uischema
    Object.entries(menuSchema).forEach(([$kind, menuOpt]) => {
      if (menuOpt && sdkDefinitions[$kind]) {
        implementedMenuSchema[$kind] = menuOpt;
      }
    });

    // Use sdk.schema title as fallback menu label.
    Object.entries(implementedMenuSchema).forEach(([$kind, menuOptions]) => {
      if (!menuOptions) return;

      const menuItems = Array.isArray(menuOptions) ? menuOptions : [menuOptions];
      menuItems.forEach((opt) => {
        if (!opt.label) {
          opt.label = getFallbackLabel($kind);
        }
      });
    });

    return { menuSchema: implementedMenuSchema, forceDisabledActions };
  }, [plugins.uiSchema, sdkSchema]);
}
