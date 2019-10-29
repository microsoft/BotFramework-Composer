// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

declare module 'ludown' {
  namespace parser {
    function parseFile(fileContent: any, log: any, locale: any): any;
    function validateLUISBlob(LUISJSONBlob: any): any;
  }
}
