'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.useActionApi = void 0;
var tslib_1 = require('tslib');
var shared_1 = require('@bfc/shared');
var useLgApi_1 = require('./useLgApi');
var useLuApi_1 = require('./useLuApi');
exports.useActionApi = function (shellApi) {
  var _a = useLgApi_1.useLgApi(shellApi),
    createLgTemplate = _a.createLgTemplate,
    readLgTemplate = _a.readLgTemplate,
    deleteLgTemplates = _a.deleteLgTemplates;
  var _b = useLuApi_1.useLuApi(shellApi),
    createLuIntent = _b.createLuIntent,
    readLuIntent = _b.readLuIntent,
    deleteLuIntents = _b.deleteLuIntents;
  var luFieldName = '_lu';
  function actionsContainLuIntent(actions) {
    var containLuIntents = false;
    shared_1.walkAdaptiveActionList(actions, function (action) {
      if (action[luFieldName]) {
        containLuIntents = true;
      }
    });
    return containLuIntents;
  }
  function constructActions(dialogId, actions) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
      var referenceLgText, referenceLuIntent;
      var _this = this;
      return tslib_1.__generator(this, function (_a) {
        referenceLgText = function (fromId, fromAction, toId, toAction, lgFieldName) {
          return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
              return [2 /*return*/, createLgTemplate(dialogId, fromAction[lgFieldName], toId, toAction, lgFieldName)];
            });
          });
        };
        referenceLuIntent = function (fromId, fromAction, toId, toAction) {
          return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
              switch (_b.label) {
                case 0:
                  _a = fromAction[luFieldName];
                  if (!_a) return [3 /*break*/, 2];
                  return [4 /*yield*/, createLuIntent(dialogId, fromAction[luFieldName], toId, toAction)];
                case 1:
                  _a = _b.sent();
                  _b.label = 2;
                case 2:
                  _a;
                  // during construction, remove the virtual LU field after intents persisted in file
                  delete toAction[luFieldName];
                  return [2 /*return*/];
              }
            });
          });
        };
        return [2 /*return*/, shared_1.deepCopyActions(actions, referenceLgText, referenceLuIntent)];
      });
    });
  }
  function copyActions(dialogId, actions) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
      var dereferenceLg, dereferenceLu;
      var _this = this;
      return tslib_1.__generator(this, function (_a) {
        dereferenceLg = function (fromId, fromAction, toId, toAction, lgFieldName) {
          return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
              return [2 /*return*/, readLgTemplate(dialogId, fromAction[lgFieldName])];
            });
          });
        };
        dereferenceLu = function (fromId, fromAction, toId, toAction) {
          return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var luValue;
            return tslib_1.__generator(this, function (_a) {
              luValue = readLuIntent(dialogId, fromId, fromAction);
              // during copy, carry the LU data in virtual field
              toAction[luFieldName] = luValue;
              return [2 /*return*/, luValue];
            });
          });
        };
        return [2 /*return*/, shared_1.deepCopyActions(actions, dereferenceLg, dereferenceLu)];
      });
    });
  }
  function constructAction(dialogId, action) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
      return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, constructActions(dialogId, [action])];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  }
  function copyAction(dialogId, action) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
      return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, copyActions(dialogId, [action])];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  }
  function deleteAction(dialogId, action) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
      return tslib_1.__generator(this, function (_a) {
        return [
          2 /*return*/,
          shared_1.deleteAction(
            action,
            function (templates) {
              return deleteLgTemplates(dialogId, templates);
            },
            function (luIntents) {
              return deleteLuIntents(dialogId, luIntents);
            }
          ),
        ];
      });
    });
  }
  function deleteActions(dialogId, actions) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
      return tslib_1.__generator(this, function (_a) {
        return [
          2 /*return*/,
          shared_1.deleteActions(
            actions,
            function (templates) {
              return deleteLgTemplates(dialogId, templates);
            },
            function (luIntents) {
              return deleteLuIntents(dialogId, luIntents);
            }
          ),
        ];
      });
    });
  }
  return {
    constructAction: constructAction,
    constructActions: constructActions,
    copyAction: copyAction,
    copyActions: copyActions,
    deleteAction: deleteAction,
    deleteActions: deleteActions,
    actionsContainLuIntent: actionsContainLuIntent,
  };
};
//# sourceMappingURL=useActionApi.js.map
