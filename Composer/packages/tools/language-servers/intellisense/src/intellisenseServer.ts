// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CompletionParams,
  DidChangeConfigurationParams,
  IConnection,
  InitializeParams,
  TextDocuments,
} from 'vscode-languageserver';
import { CompletionItem, CompletionList } from 'vscode-languageserver-types';
import Fuse from 'fuse.js';

import { expressionsResolver } from './resolvers/expressions';
import { userVariablesResolver } from './resolvers/userVariables';
import { variableScopesResolver } from './resolvers/variableScopes';
import { getCompletionString, getRangeAtPosition } from './utils/intellisenseServerUtils';

type IntellisenseScope = 'expressions' | 'user-variables' | 'variable-scopes';

export class IntellisenseServer {
  // TextFields content is stored in TextDocuments
  protected readonly documents = new TextDocuments();
  // Scopes are used to know what type of results to return (eg: "user-variables, "expressions")
  protected scopes: IntellisenseScope[] | undefined;
  // Project id is necessary when calling memoryResolver to get user variables
  protected projectId: string | undefined;

  constructor(
    protected readonly connection: IConnection,
    protected readonly memoryResolver: (projectId: string) => string[]
  ) {
    this.documents.listen(connection);
    this.connection.onInitialize((params) => this.initialize(params));
    this.connection.onDidChangeConfiguration((params) => this.changeConfiguration(params));
    this.connection.onCompletion(async (params) => this.completion(params));
  }

  start() {
    this.connection.listen();
  }

  protected initialize = (params: InitializeParams) => {
    this.scopes = params.initializationOptions?.scopes;
    this.projectId = params.initializationOptions?.projectId;

    return {
      capabilities: {
        completionProvider: {
          resolveProvider: true,
        },
      },
    };
  };

  protected changeConfiguration = (params: DidChangeConfigurationParams) => {
    this.scopes = params.settings.scopes;
  };

  protected async completion(params: CompletionParams): Promise<CompletionList | null> {
    const document = this.documents.get(params.textDocument.uri);

    if (document) {
      const range = getRangeAtPosition(document, params.position);
      const wordAtCurRange = document.getText(range);

      if (wordAtCurRange && wordAtCurRange !== '') {
        const completionItems = this.getCompletionItems();

        const fuse = new Fuse(completionItems, {
          includeScore: true,
          threshold: 0.2,
          includeMatches: true,
          keys: ['label'],
        });
        const fuseSearchResults = fuse.search(wordAtCurRange);

        const results: CompletionItem[] = fuseSearchResults.map((result: Fuse.FuseResult<CompletionItem>) => {
          const completionString = getCompletionString(wordAtCurRange, result.item.label);

          // "matches" are used to know what to highlight
          // "range" is used to know which section of text to replace with "completionString"
          const returnedResult = {
            ...result.item,
            completion: completionString,
            data: { matches: result.matches, range: range },
          };

          return returnedResult;
        });

        return Promise.resolve({
          isIncomplete: false,
          items: results,
        });
      }
    }

    return Promise.resolve(null);
  }

  protected getCompletionItems(): CompletionItem[] {
    let completionItems: CompletionItem[] = [];

    if (this.scopes) {
      if (this.scopes.includes('user-variables') && this.projectId) {
        completionItems = completionItems.concat(userVariablesResolver(this.memoryResolver(this.projectId)));
      }
      if (this.scopes.includes('expressions')) {
        completionItems = completionItems.concat(expressionsResolver());
      }
      if (this.scopes.includes('variable-scopes')) {
        completionItems = completionItems.concat(variableScopesResolver());
      }
    }

    return completionItems;
  }
}
