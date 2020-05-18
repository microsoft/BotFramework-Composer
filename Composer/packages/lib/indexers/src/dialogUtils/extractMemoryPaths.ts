// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';
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
  switch (value.$kind) {
    case SDKKinds.NumberInput:
    case SDKKinds.TextInput:
    case SDKKinds.ConfirmInput:
    case SDKKinds.ChoiceInput:
    case SDKKinds.AttachmentInput:
    case SDKKinds.DateTimeInput:
    case SDKKinds.SetProperty:
      properties = [value.property];
      break;
    case SDKKinds.OAuthInput:
      properties = [value.tokenProperty];
      break;
    case SDKKinds.SetProperties:
      properties = value.assignments?.map((assignment) => assignment.property);
      break;
    case SDKKinds.HttpRequest:
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
function ExtractMemoryPaths(dialog: { [key: string]: any }): string[] {
  let properties: string[] = [];

  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    if (has(value, '$kind')) {
      properties = [...properties, ...getProperties(value)];
    }
    return false;
  };
  JsonWalk('$', dialog, visitor);

  return Array.from(new Set<string>(properties));
}

export default ExtractMemoryPaths;
