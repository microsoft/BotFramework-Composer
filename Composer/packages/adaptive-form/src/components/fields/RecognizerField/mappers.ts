// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerSchema } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

export const mapDropdownOptionToRecognizerSchema = (option: IDropdownOption, recognizerConfigs: RecognizerSchema[]) => {
  return recognizerConfigs.find((r) => r.id === option.key);
};

export const mapRecognizerSchemaToDropdownOption = (recognizerSchema: RecognizerSchema): IDropdownOption => {
  const { id, displayName } = recognizerSchema;
  return { key: id, text: typeof displayName === 'function' ? displayName({}) : displayName };
};

export const FallbackRecognizerId = SDKKinds.CustomRecognizer;
