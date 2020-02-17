/// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

declare module '@bfcomposer/bf-lu/lib/parser' {
  namespace parser {
    function parseFile(fileContent: any, log: any, locale: any): any;
    function validateLUISBlob(LUISJSONBlob: any): any;
  }
  namespace sectionHandler {
    namespace luParser {
      function parse(content: string): any;
    }
    function sectionOperator(resource: any): void;
    const luSectionTypes: any;
  }
}
