// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { builtInFunctionsGrouping } from '@bfc/built-in-functions';
import { LgTemplate } from '@bfc/shared';
import * as React from 'react';

import { FunctionRefPayload, PropertyRefPayload, TemplateRefPayload } from './types';

export const useLgEditorToolbarItems = (
  lgTemplates: readonly LgTemplate[],
  properties: readonly string[],
  selectToolbarMenuItem: (text: string) => void
) => {
  const templateRefPayload = React.useMemo(
    () =>
      ({
        kind: 'templateRef',
        data: { templates: lgTemplates, onSelectTemplate: selectToolbarMenuItem },
      } as TemplateRefPayload),
    [lgTemplates, selectToolbarMenuItem]
  );

  const propertyRefPayload = React.useMemo(
    () =>
      ({ kind: 'propertyRef', data: { properties, onSelectProperty: selectToolbarMenuItem } } as PropertyRefPayload),
    [properties]
  );

  const functionRefPayload = React.useMemo(
    () =>
      ({
        kind: 'functionRef',
        data: { functions: builtInFunctionsGrouping, onSelectFunction: selectToolbarMenuItem },
      } as FunctionRefPayload),
    [builtInFunctionsGrouping, selectToolbarMenuItem]
  );

  return { templateRefPayload, propertyRefPayload, functionRefPayload };
};
