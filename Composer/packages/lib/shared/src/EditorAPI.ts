// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

type EditorAPIHandler = () => any;

export interface EditorAPI {
  Editing: {
    Undo: EditorAPIHandler;
    Redo: EditorAPIHandler;
  };
  Actions: {
    CopySelection: EditorAPIHandler;
    CutSelection: EditorAPIHandler;
    MoveSelection: EditorAPIHandler;
    DeleteSelection: EditorAPIHandler;
    DisableSelection: EditorAPIHandler;
    EnableSelection: EditorAPIHandler;
  };
}

const EmptyHandler = () => null;

const DefaultEditorAPI: EditorAPI = {
  Editing: {
    Undo: EmptyHandler,
    Redo: EmptyHandler,
  },
  Actions: {
    CopySelection: EmptyHandler,
    CutSelection: EmptyHandler,
    MoveSelection: EmptyHandler,
    DeleteSelection: EmptyHandler,
    DisableSelection: EmptyHandler,
    EnableSelection: EmptyHandler,
  },
};

const EDITOR_API_NAME = 'EditorAPI';

export function getEditorAPI(): EditorAPI {
  if (!window[EDITOR_API_NAME]) {
    window[EDITOR_API_NAME] = { ...DefaultEditorAPI };
  }
  return window[EDITOR_API_NAME];
}

export function registerEditorAPI(domain: 'Editing' | 'Actions', handlers: { [fn: string]: EditorAPIHandler }) {
  const editorAPI: EditorAPI = getEditorAPI();

  // reject unrecognized api domain.
  if (!editorAPI[domain]) return;

  const domainAPIs = editorAPI[domain];
  const overridedAPIs = Object.keys(handlers)
    .filter((fnName) => !!domainAPIs[fnName])
    .reduce((results, fnName) => {
      results[fnName] = handlers[fnName];
      return results;
    }, {});

  const newDomainAPIs = {
    ...domainAPIs,
    ...overridedAPIs,
  };
  editorAPI[domain] = newDomainAPIs as any;
}
