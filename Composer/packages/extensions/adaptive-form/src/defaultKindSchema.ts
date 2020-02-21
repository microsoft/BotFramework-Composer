// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { KindSchema } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import { RecognizerField } from './components/fields';

const DefaultKindSchema: KindSchema = {
  [SDKKinds.Recognizer]: {
    field: RecognizerField,
  },
};

export default DefaultKindSchema;
