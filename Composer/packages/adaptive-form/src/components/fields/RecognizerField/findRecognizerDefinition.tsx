// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerSchema } from '@bfc/extension-client';
import { MicrosoftIRecognizer, SDKKinds } from '@bfc/shared';

export const FallbackRecognizerId = SDKKinds.CustomRecognizer;

export const getRecognizerDefinition = (
  recognizerValue: MicrosoftIRecognizer | undefined,
  recognizerDefinitions: RecognizerSchema[]
) => {
  return (
    recognizerDefinitions.find((x) => x.isSelected(recognizerValue)) ??
    recognizerDefinitions.find((x) => x.id === FallbackRecognizerId)
  );
};
