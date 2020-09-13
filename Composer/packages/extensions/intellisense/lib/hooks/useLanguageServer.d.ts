import { CompletionItem } from 'vscode-languageserver-types';
/**
 * A hook that connects to a LSP server. It takes information about a textField (value, position) and returns completion results
 * @param url url of the LSP server
 * @param scopes scopes are used to filter the type of completion results to show (variables, expressions, etc..)
 * @param documentUri a unique identifier for the textField
 * @param textFieldValue current value of textField
 * @param cursorPosition position of textField cursor
 */
export declare const useLanguageServer: (
  url: string,
  scopes: string[],
  documentUri: string,
  textFieldValue: string,
  cursorPosition: number,
  projectId?: string | undefined
) => CompletionItem[];
//# sourceMappingURL=useLanguageServer.d.ts.map
