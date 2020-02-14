/// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

declare module '@bfcomposer/bf-lu/lib/parser/luBuild' {
  namespace luBuild {
    class Builder {
      private readonly handler: (input: string) => any;

      constructor(handler: any);

      LoadContents(
        files: string[],
        culture: string,
        suffix: string,
        region: string,
        stdin?: string
      ): { luContents: any[]; recognizers: Map<string, any>; multiRecognizers: Map<string, any>; settings: any };

      build(
        luContents: any[],
        recognizers: Map<string, any>,
        authoringKey: string,
        region: string,
        botName: string,
        suffix: string,
        fallbackLocale: string,
        multiRecognizers?: Map<string, any>,
        settings?: any
      ): any[];

      writeDialogAssets(contents: any[], force: boolean, out: string): void;
    }
  }
}
