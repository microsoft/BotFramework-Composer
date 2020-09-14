'use strict';
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true });
exports.IntellisenseTextField = void 0;
var tslib_1 = require('tslib');
var react_1 = tslib_1.__importDefault(require('react'));
var useLanguageServer_1 = require('../hooks/useLanguageServer');
var uiUtils_1 = require('../utils/uiUtils');
var CompletionList_1 = require('./CompletionList');
exports.IntellisenseTextField = react_1.default.memo(function (props) {
  var url = props.url,
    scopes = props.scopes,
    projectId = props.projectId,
    id = props.id,
    value = props.value,
    onChange = props.onChange,
    children = props.children;
  var _a = react_1.default.useState(''),
    textFieldValue = _a[0],
    setTextFieldValue = _a[1];
  var _b = react_1.default.useState(false),
    showCompletionList = _b[0],
    setShowCompletionList = _b[1];
  var _c = react_1.default.useState(0),
    selectedCompletionItem = _c[0],
    setSelectedCompletionItem = _c[1];
  var _d = react_1.default.useState(0),
    cursorPosition = _d[0],
    setCursorPosition = _d[1];
  var didComplete = react_1.default.useRef(false);
  var mainContainerRef = react_1.default.useRef(null);
  var completionListRef = react_1.default.useRef(null);
  var completionItems = useLanguageServer_1.useLanguageServer(
    url,
    scopes,
    id,
    textFieldValue,
    cursorPosition,
    projectId
  );
  // If value is provided then component becomes controlled
  react_1.default.useEffect(
    function () {
      if (value !== undefined && value !== textFieldValue) {
        setTextFieldValue(value);
      }
    },
    [value]
  );
  // Show the completion list again every time the results are different (unless something was just selected from the list)
  react_1.default.useEffect(
    function () {
      setSelectedCompletionItem(0);
      if (didComplete.current) {
        didComplete.current = false;
      } else {
        if (completionItems && completionItems.length) {
          setShowCompletionList(true);
        } else {
          setShowCompletionList(false);
        }
      }
    },
    [completionItems]
  );
  // Closes the list of completion items if user clicks away from component or presses "Escape"
  react_1.default.useEffect(function () {
    var outsideClickHandler = function (event) {
      var x = event.x,
        y = event.y;
      if (mainContainerRef.current && completionListRef.current) {
        if (
          uiUtils_1.checkIsOutside(x, y, mainContainerRef.current) &&
          uiUtils_1.checkIsOutside(x, y, completionListRef.current)
        ) {
          setShowCompletionList(false);
        }
      }
    };
    var keyupHandler = function (event) {
      if (event.key === 'Escape') {
        setShowCompletionList(false);
      }
    };
    document.body.addEventListener('click', outsideClickHandler);
    document.body.addEventListener('keyup', keyupHandler);
    return function () {
      document.body.removeEventListener('click', outsideClickHandler);
      document.body.removeEventListener('keyup', keyupHandler);
    };
  }, []);
  // When textField value is changed
  var onValueChanged = function (newValue) {
    setTextFieldValue(newValue);
    onChange(newValue);
  };
  // Set textField value to completion item value
  var setValueToSelectedCompletionItem = function (index) {
    if (index < completionItems.length) {
      var selectedSuggestion = completionItems[index].insertText || '';
      var range = completionItems[index].data.range;
      if (range) {
        var newValue =
          textFieldValue.substr(0, range.start.character) +
          selectedSuggestion +
          textFieldValue.substr(range.end.character);
        onValueChanged(newValue);
      } else {
        onValueChanged(selectedSuggestion);
      }
      // This makes sure we do not show the completion items after a value is picked from the list
      didComplete.current = true;
      setShowCompletionList(false);
    }
  };
  // Handles selection of completion items and validation through keyboard (Up Down to navigate and Enter to validate)
  var onKeyUpMainComponent = function (event) {
    switch (event.key) {
      case 'ArrowDown':
        (completionItems === null || completionItems === void 0 ? void 0 : completionItems.length) &&
          setSelectedCompletionItem(function (index) {
            return (
              (index + 1) % (completionItems === null || completionItems === void 0 ? void 0 : completionItems.length)
            );
          });
        break;
      case 'ArrowUp':
        (completionItems === null || completionItems === void 0 ? void 0 : completionItems.length) &&
          setSelectedCompletionItem(function (index) {
            return (
              ((completionItems === null || completionItems === void 0 ? void 0 : completionItems.length) + index - 1) %
              (completionItems === null || completionItems === void 0 ? void 0 : completionItems.length)
            );
          });
        break;
      case 'Enter':
        setValueToSelectedCompletionItem(selectedCompletionItem);
        break;
    }
  };
  // Handles validation of a suggested completion item when clicking on it
  var onClickCompletionItem = function (suggestionIndex) {
    setValueToSelectedCompletionItem(suggestionIndex);
  };
  // Prevents cursor from moving around in textField when going through the list of completion items
  var onKeyDownTextField = function (event) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        if (completionItems === null || completionItems === void 0 ? void 0 : completionItems.length) {
          event.preventDefault();
        }
        break;
    }
  };
  var onKeyUpTextField = function (event) {
    // Typing also modifies the cursor position
    setCursorPosition(event.target.selectionStart || 0);
  };
  // Updates position of cursor
  var onClickTextField = function (event) {
    setCursorPosition(event.target.selectionStart || 0);
  };
  return react_1.default.createElement(
    'div',
    { onKeyUp: onKeyUpMainComponent, ref: mainContainerRef, style: { position: 'relative' } },
    children(textFieldValue, onValueChanged, onKeyDownTextField, onKeyUpTextField, onClickTextField),
    showCompletionList &&
      react_1.default.createElement(CompletionList_1.CompletionList, {
        ref: completionListRef,
        completionItems: completionItems,
        selectedItem: selectedCompletionItem,
        onClickCompletionItem: onClickCompletionItem,
      })
  );
});
//# sourceMappingURL=IntellisenseTextField.js.map
