// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TriggerFormDataErrors } from './TriggerFormDataErrors';

export interface TriggerFormData {
  errors: TriggerFormDataErrors;
  $kind: string;
  event: string;
  intent: string;
  triggerPhrases: string;
  regEx: string;
}
