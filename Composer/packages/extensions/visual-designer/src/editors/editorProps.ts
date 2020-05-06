// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface EditorProps {
  id: string;
  data: any;
  onEvent: (action, id) => object | void;
}

export const defaultEditorProps = {
  id: '',
  data: {},
  onEvent: () => {},
};
