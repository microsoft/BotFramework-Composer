// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EditorConfig } from '../../../src/adaptive-flow-editor/constants/editorConfig';

describe('EditorConfig', () => {
  it('should cover several features.', () => {
    expect(EditorConfig).toBeTruthy();
    expect(EditorConfig.features).toBeDefined();

    expect(EditorConfig.features.showEvents).toBeDefined();
    expect(EditorConfig.features.arrowNavigation).toBeDefined();
    expect(EditorConfig.features.tabNavigation).toBeDefined();
    expect(EditorConfig.features.keyboardNodeEditing).toBeDefined();
    expect(EditorConfig.features.keyboardOperationEditing).toBeDefined();
  });
});
