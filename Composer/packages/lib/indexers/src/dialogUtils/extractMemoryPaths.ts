// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes } from '@bfc/shared';
import has from 'lodash/has';

import { VisitorFunc, JsonWalk } from '../utils/jsonWalk';

//limit the scope
export function checkProperty(property: string): boolean {
  const scopePatt = /(user|conversation|dialog|this).[\S]+$/;
  return scopePatt.test(property.trim());
}

// find all properties from specific type
export function getProperties(value: any): string[] {
  let properties: string[] = [];
  switch (value.$type) {
    case SDKTypes.NumberInput:
    case SDKTypes.TextInput:
    case SDKTypes.ConfirmInput:
    case SDKTypes.ChoiceInput:
    case SDKTypes.AttachmentInput:
    case SDKTypes.DateTimeInput:
    case SDKTypes.SetProperty:
      properties = [value.property];
      break;
    case SDKTypes.OAuthInput:
      properties = [value.tokenProperty];
      break;
    case SDKTypes.SetProperties:
      properties = value.assignments?.map(assignment => assignment.property);
      break;
    case SDKTypes.HttpRequest:
      properties = [value.resultProperty];
      break;
  }
  return (
    properties?.reduce((result: string[], property) => {
      if (typeof property === 'string' && checkProperty(property)) result.push(property);
      return result;
    }, []) || []
  );
}

// find out all properties from given dialog
function ExtractMemoryPaths(dialog): string[] {
  let properties: string[] = [];

  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    if (has(value, '$type')) {
      properties = [...properties, ...getProperties(value)];
    }
    return false;
  };
  JsonWalk('$', dialog, visitor);

  return Array.from(new Set<string>(properties));
}

export default ExtractMemoryPaths;
