// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@botframework-composer/types';

import { RecognizerSchema } from './formSchema';

// A set of recognizer field templates for seeding new recognizer intance.
type RecognizerFieldSets = { fields: { [key: string]: string | number | boolean } };

// Omit the 'id' field because it can be inferred from $kind.
export type RecognizerOptions = Omit<RecognizerSchema, 'id'> & Partial<RecognizerFieldSets>;

export type RecognizerUISchema = { [key in SDKKinds]?: RecognizerOptions };
