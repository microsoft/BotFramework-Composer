'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.useDialogApi = void 0;
exports.useDialogApi = function (shellApi) {
  var getDialog = shellApi.getDialog,
    saveDialog = shellApi.saveDialog,
    createDialog = shellApi.createDialog;
  return {
    createDialog: function () {
      return createDialog([]);
    },
    readDialog: getDialog,
    updateDialog: saveDialog,
  };
};
//# sourceMappingURL=useDialogApi.js.map
