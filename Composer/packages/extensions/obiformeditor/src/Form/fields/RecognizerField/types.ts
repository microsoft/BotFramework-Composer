// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes } from '@bfc/shared';

export interface IRecognizerType {
  $type: SDKTypes;
  id: string;
}
export interface ICrossTrainedRecognizerSet {
  $type: SDKTypes;
  recognizers: string[];
}
export interface IRecognizer {
  $type: string;
  recognizers: (
    | {
        $type: string;
        recognizers: {
          'en-us': IRecognizerType | string | ICrossTrainedRecognizerSet;
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
