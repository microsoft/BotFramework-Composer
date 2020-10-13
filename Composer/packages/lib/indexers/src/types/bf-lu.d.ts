/// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

declare module '@microsoft/bf-lu/lib/parser/composerindex' {
  namespace parser {
    function parseFile(fileContent: any, log: any, locale: any, luFeatures: any): any;
    function validateLUISBlob(LUISJSONBlob: any): any;
    function validateResource(resource: any, luFeatures: any): any;
  }
  namespace sectionHandler {
    namespace luParser {
      function parse(content: string): any;
    }
    function sectionOperator(resource: any): void;
    const luSectionTypes: any;
  }
}
