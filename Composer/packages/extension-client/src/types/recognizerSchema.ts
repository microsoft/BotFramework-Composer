// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerSchema } from './formSchema';

// Omit the 'id' field because it can be get from $kind.
export type RecognizerOptions = Omit<RecognizerSchema, 'id'>;
