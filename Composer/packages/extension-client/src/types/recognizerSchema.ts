// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/types';

import { RecognizerSchema } from './formSchema';

// Omit the 'id' field because it can be inferred from $kind.
export type RecognizerOptions = Omit<RecognizerSchema, 'id'>;

export type RecognizerUISchema = { [key in SDKKinds]?: RecognizerOptions };
