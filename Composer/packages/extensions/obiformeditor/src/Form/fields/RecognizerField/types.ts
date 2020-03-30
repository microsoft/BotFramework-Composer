// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes } from '@bfc/shared';

export interface IRecognizerType {
  $type: SDKTypes;
  id: string;
}
export interface IRecognizer {
  $type: string;
  recognizers: (
    | {
        $type: string;
        recognizers: {
          'en-us': IRecognizerType | string;
        };
        id?: undefined;
      }
    | {
        $type: SDKTypes;
        id: string;
        recognizers?: undefined;
      }
  )[];
}
