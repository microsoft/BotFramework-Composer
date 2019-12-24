// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { readFile } from 'fs';

import { xhr, getErrorStatusDescription } from 'request-light';
import URI from 'vscode-uri';
import { IConnection, TextDocuments } from 'vscode-languageserver';
import {
  TextDocument,
  Diagnostic,
  CompletionList,
  Hover,
  CompletionItemKind,
  CompletionItem,
  Range,
  DiagnosticSeverity,
} from 'vscode-languageserver-types';
import { TextDocumentPositionParams } from 'vscode-languageserver-protocol';
import get from 'lodash/get';
import { LgFile, LgTemplate, lgIndexer, filterTemplateDiagnostics, isValid } from '@bfc/indexers';

import { buildInfunctionsMap } from './builtinFunctionsMap';
import {
  getRangeAtPosition,
  updateTemplateInContent,
  LGDocument,
  checkTemplate,
  convertDiagnostics,
  generageDiagnostic,
  LGOption,
  parse,
} from './utils';

const { check } = lgIndexer;

// define init methods call from client
const InitializeDocumentsMethodName = 'initializeDocuments';

const allowedCompletionStates = ['expression'];

export class LGServer {
  protected workspaceRoot?: URI;
  protected readonly documents = new TextDocuments();
  protected readonly pendingValidationRequests = new Map<string, number>();
  /**
   * LG documents infomation store.
   * The connection between lgOption and botProjectService.
   * Help do inline template editing and server resource passing.
   */
  protected LGDocuments: LGDocument[] = [];

  constructor(protected readonly connection: IConnection, protected readonly botProjectService?) {
    this.documents.listen(this.connection);
    this.documents.onDidChangeContent(change => this.validate(change.document));
    this.documents.onDidClose(event => {
      this.cleanPendingValidation(event.document);
      this.cleanDiagnostics(event.document);
    });

    this.connection.onInitialize(params => {
      if (params.rootPath) {
        this.workspaceRoot = URI.file(params.rootPath);
      } else if (params.rootUri) {
        this.workspaceRoot = URI.parse(params.rootUri);
      }
      this.connection.console.log('The server is initialized.');
      return {
        capabilities: {
          textDocumentSync: this.documents.syncKind,
          codeActionProvider: false,
          completionProvider: {
            resolveProvider: true,
          },
          hoverProvider: true,
          foldingRangeProvider: false,
        },
      };
    });
    this.connection.onCompletion(params => this.completion(params));
    this.connection.onHover(params => this.hover(params));

    this.connection.onRequest((method, params) => {
      if (InitializeDocumentsMethodName === method) {
        const { uri, lgOption }: { uri: string; lgOption?: LGOption } = params;
        this.LGDocuments.push({ uri, lgOption });
        // run diagnostic
        const textDocument = this.documents.get(uri);
        if (textDocument) {
          if (lgOption) this.verifyLgOption(lgOption, textDocument);
          this.validate(textDocument);
        }
      }
    });
  }

  protected verifyLgOption(lgOption: LGOption, document: TextDocument) {
    const diagnostics: string[] = [];

    if (!this.botProjectService) {
      diagnostics.push('[Error lgOption] botProjectService is required but not exist.');
    } else {
      const { fileId, templateId } = lgOption;
      const lgFile = this.getLGFile(fileId);
      if (!lgFile) {
        diagnostics.push(`[Error lgOption] File ${fileId}.lg do not exist`);
      } else {
        const { templates } = lgFile;
        const template = templates.find(({ name }) => name === templateId);
        if (!template) diagnostics.push(`Template ${fileId}.lg#${templateId} do not exist`);
      }
    }
    this.connection.console.log(diagnostics.join('\n'));
    this.sendDiagnostics(
      document,
      diagnostics.map(errorMsg => generageDiagnostic(errorMsg, DiagnosticSeverity.Error, document))
    );
  }

  start() {
    this.connection.listen();
  }

  protected getLGOption(document: TextDocument): LGOption | undefined {
    const LGDocument = this.LGDocuments.find(item => item.uri === document.uri);
    if (!LGDocument || !LGDocument.lgOption) return;
    const { lgOption } = LGDocument;
    return lgOption;
  }

  protected getLGFile(fileId: string): LgFile | undefined {
    const currentProject = this.botProjectService?.getCurrentBotProject();
    if (!currentProject) return;
    const { lgFiles } = currentProject.getIndexes();
    return lgFiles.find(({ id }) => id === fileId);
  }

  protected getLGTemplate(fileId: string, templateId: string): LgTemplate | undefined {
    const lgFile = this.getLGFile(fileId);
    if (!lgFile) return;
    const { templates } = lgFile;
    return templates.find(({ name }) => name === templateId);
  }

  protected getLGDocument(document: TextDocument): LGDocument | undefined {
    return this.LGDocuments.find(({ uri }) => uri === document.uri);
  }

  /**
   *
   * @param document
   * 1. if !botProjectService, return text;
   * 2. if botProjectService && !lgOption, return text;
   * 3. if botProjectService
   */
  protected getLGDocumentContent(document: TextDocument): string {
    const text = document.getText();
    const lgOption = this.getLGOption(document);
    if (!lgOption) return text;

    const { fileId, templateId } = lgOption;
    const lgFile = this.getLGFile(fileId);
    if (!lgFile) return text;
    const { content } = lgFile;

    const template = this.getLGTemplate(fileId, templateId);
    if (!template) return content;

    const updatedTemplate = {
      name: template.name,
      parameters: template.parameters,
      body: text,
    };

    const templateDiags = checkTemplate(updatedTemplate);
    if (isValid(templateDiags)) {
      return updateTemplateInContent(content, updatedTemplate);
    }
    return content;
  }

  protected hover(params: TextDocumentPositionParams): Thenable<Hover | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
    const text = this.getLGDocumentContent(document);
    const { templates, diagnostics } = parse(text, document);
    if (diagnostics.length) {
      this.sendDiagnostics(document, diagnostics);
      return Promise.resolve(null);
    }
    const wordRange = getRangeAtPosition(document, params.position);
    let word = document.getText(wordRange);
    const matchItem = templates.find(u => u.name === word);
    if (matchItem) {
      const hoveritem: Hover = { contents: [matchItem.body] };
      return Promise.resolve(hoveritem);
    }
    if (word.startsWith('builtin.')) {
      word = word.substring(8);
    }

    if (buildInfunctionsMap.has(word)) {
      const functionEntity = buildInfunctionsMap.get(word);
      if (!functionEntity) {
        return Promise.resolve(null);
      }
      const hoveritem: Hover = {
        contents: [
          `Parameters: ${get(functionEntity, 'Params', []).join(', ')}`,
          `Documentation: ${get(functionEntity, 'Introduction', '')}`,
          `ReturnType: ${get(functionEntity, 'Returntype', '').valueOf()}`,
        ],
      };
      return Promise.resolve(hoveritem);
    }
    return Promise.resolve(null);
  }

  protected async resolveSchema(url: string): Promise<string> {
    const uri = URI.parse(url);
    if (uri.scheme === 'file') {
      return new Promise<string>((resolve, reject) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        readFile(uri.fsPath, 'UTF-8', (err, result) => {
          err ? reject('') : resolve(result.toString());
        });
      });
    }
    try {
      const response = await xhr({ url, followRedirects: 5 });
      return response.responseText;
    } catch (error) {
      return Promise.reject(error.responseText || getErrorStatusDescription(error.status) || error.toString());
    }
  }

  private removeParamFormat(params: string): string {
    const resultArr = params.split(',').map(element => {
      return element.trim().split(':')[0];
    });
    return resultArr.join(' ,');
  }

  private matchedStates(params: TextDocumentPositionParams): { matched: boolean; state: string } | null {
    const state: string[] = [];
    const document = this.documents.get(params.textDocument.uri);
    if (!document) return null;
    const position = params.position;
    const range = Range.create(position.line, 0, position.line, position.character);
    const lineContent = document.getText(range);
    if (!lineContent.trim().startsWith('-')) {
      return { matched: false, state: '' };
    }

    //initialize the root state to plaintext
    state.push('PlainText');

    // find out the context state of current cursor, offer precise suggestion and completion etc.
    /**
     * - Hi, @{name}, what's the meaning of 'state'
     * - Hi---------, @{name}--------, what-------' ------s the meaning of "state"
     * - <plaintext>, @{<expression>}, <plaintext><single><plaintext>------<double>
     */
    let i = 0;
    while (i < lineContent.length) {
      const char = lineContent.charAt(i);
      if (char === `'`) {
        if (state[state.length - 1] === 'expression' || state[state.length - 1] === 'double') {
          state.push('single');
        } else {
          state.pop();
        }
      }

      if (char === `"`) {
        if (state[state.length - 1] === 'expression' || state[state.length - 1] === 'single') {
          state.push('double');
        } else {
          state.pop();
        }
      }

      if (char === '{' && i >= 1 && state[state.length - 1] !== 'single' && state[state.length - 1] !== 'double') {
        if (lineContent.charAt(i - 1) === '@') {
          state.push('expression');
        }
      }

      if (char === '}' && state[state.length - 1] === 'expression') {
        state.pop();
      }
      i++;
    }
    const finalState = state[state.length - 1];
    return { matched: true, state: finalState };
  }

  protected completion(params: TextDocumentPositionParams): Thenable<CompletionList | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
    const text = this.getLGDocumentContent(document);

    const diags = check(text, '');

    if (isValid(diags) === false) {
      return Promise.resolve(null);
    }

    const { templates, diagnostics } = parse(text, document);
    if (diagnostics.length) {
      this.sendDiagnostics(document, diagnostics);
      return Promise.resolve(null);
    }

    const completionTemplateList: CompletionItem[] = templates.map(template => {
      return {
        label: template.name,
        kind: CompletionItemKind.Reference,
        insertText:
          template.parameters.length > 0 ? template.name + '(' + template.parameters.join(', ') + ')' : template.name,
        documentation: template.body,
      };
    });

    const completionFunctionList: CompletionItem[] = Array.from(buildInfunctionsMap).map(item => {
      const [key, value] = item;
      return {
        label: key,
        kind: CompletionItemKind.Function,
        insertText: key + '(' + this.removeParamFormat(value.Params.toString()) + ')',
        documentation: value.Introduction,
      };
    });

    const completionList = completionTemplateList.concat(completionFunctionList);

    const matchResult = this.matchedStates(params);
    // TODO: more precise match
    if (
      matchResult &&
      matchResult.matched &&
      matchResult.state &&
      allowedCompletionStates.includes(matchResult.state.toLowerCase())
    ) {
      return Promise.resolve({ isIncomplete: true, items: completionList });
    } else {
      return Promise.resolve(null);
    }
  }

  protected validate(document: TextDocument): void {
    this.cleanPendingValidation(document);
    this.pendingValidationRequests.set(
      document.uri,
      setTimeout(() => {
        this.pendingValidationRequests.delete(document.uri);
        this.doValidate(document);
      })
    );
  }

  protected cleanPendingValidation(document: TextDocument): void {
    const request = this.pendingValidationRequests.get(document.uri);
    if (typeof request !== 'undefined') {
      clearTimeout(request);
      this.pendingValidationRequests.delete(document.uri);
    }
  }

  protected doValidate(document: TextDocument): void {
    const text = document.getText();
    const LGDocument = this.getLGDocument(document);

    // uninitialized
    if (!LGDocument) {
      return;
    }

    if (text.length === 0) {
      this.cleanDiagnostics(document);
      return;
    }

    // if inline editor, concat new content for validate
    const { lgOption } = LGDocument;
    if (lgOption) {
      const { templateId, fileId } = lgOption;
      const templateDiags = checkTemplate({
        name: templateId,
        parameters: [],
        body: text,
      });
      // error in template.
      if (isValid(templateDiags) === false) {
        const diagnostics = convertDiagnostics(templateDiags, document, 1);
        this.sendDiagnostics(document, diagnostics);
        return;
      }

      const fullText = this.getLGDocumentContent(document);
      const { templates } = parse(text, document);
      const template = templates.find(({ name }) => name === templateId);
      if (!template) return;

      // filter diagnostics belong to this template.
      const lgDiagnostics = filterTemplateDiagnostics(check(fullText, fileId), template);
      const diagnostics = convertDiagnostics(lgDiagnostics, document, 1);
      this.sendDiagnostics(document, diagnostics);
      return;
    }
    const lgDiagnostics = check(text, '');
    const diagnostics = convertDiagnostics(lgDiagnostics, document);
    this.sendDiagnostics(document, diagnostics);
  }

  protected cleanDiagnostics(document: TextDocument): void {
    this.sendDiagnostics(document, []);
  }

  protected sendDiagnostics(document: TextDocument, diagnostics: Diagnostic[]): void {
    this.connection.sendDiagnostics({
      uri: document.uri,
      diagnostics,
    });
  }
}
