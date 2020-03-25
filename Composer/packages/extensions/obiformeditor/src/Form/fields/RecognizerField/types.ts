// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes } from '@bfc/shared';

export interface ICheckOption {
  checked: boolean;
  disabled: boolean;
  label: string;
  id: string;
}

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
          'en-us': {
            $type: string;
            recognizers: (IRecognizerType | string)[];
          };
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
