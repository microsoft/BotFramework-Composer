// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { builtInFunctionsGrouping } from '@bfc/built-in-functions';
import { LgTemplate } from '@bfc/shared';
import * as React from 'react';

import { FunctionRefPayload, PropertyRefPayload, TemplateRefPayload, ToolbarButtonPayload } from '../types';

export const useEditorToolbarItems = (
  lgTemplates: readonly LgTemplate[],
  properties: readonly string[],
  selectToolbarMenuItem: (itemText: string, itemType: ToolbarButtonPayload['kind']) => void
) => {
  const templateRefPayload = React.useMemo(
    () =>
      ({
        kind: 'template',
        data: { templates: lgTemplates, onSelectTemplate: selectToolbarMenuItem },
      } as TemplateRefPayload),
    [lgTemplates, selectToolbarMenuItem]
  );

  const propertyRefPayload = React.useMemo(
    () => ({ kind: 'property', data: { properties, onSelectProperty: selectToolbarMenuItem } } as PropertyRefPayload),
    [properties, selectToolbarMenuItem]
  );

  const functionRefPayload = React.useMemo(
    () =>
      ({
        kind: 'function',
        data: { functions: builtInFunctionsGrouping, onSelectFunction: selectToolbarMenuItem },
      } as FunctionRefPayload),
    [builtInFunctionsGrouping, selectToolbarMenuItem]
  );

  return { templateRefPayload, propertyRefPayload, functionRefPayload };
};
