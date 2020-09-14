// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PromptTab } from '@bfc/shared';
import { Direction } from '../type';
function parseSelector(path) {
  if (!path) return null;
  var selectors = path.split('.');
  if (selectors.length === 0) {
    return null;
  }
  if (selectors[0] === '$' || selectors[0] === '') {
    selectors.shift();
  }
  var normalizedSelectors = selectors.reduce(function (result, selector) {
    // e.g. actions[0]
    var parseResult = /(\w+)\[(-\d+|\d+)\]/.exec(selector);
    if (parseResult) {
      var objSelector = parseResult[1],
        arraySelector = parseResult[2];
      var arrayIndex = parseInt(arraySelector);
      result.push(objSelector, arrayIndex);
    } else {
      result.push(selector);
    }
    return result;
  }, []);
  return normalizedSelectors;
}
function transformDefaultBranch(path) {
  return path.replace(new RegExp('default', 'g'), 'default[-1].actions');
}
export function filterPromptElementsBySchema(currentElement, elements, direction) {
  var candidateElements = elements;
  switch (direction) {
    case Direction.Up:
      if (currentElement.tab === PromptTab.OTHER || currentElement.tab === PromptTab.USER_INPUT) {
        candidateElements = elements.filter(function (ele) {
          return ele.selectedId === '' + currentElement.focusedId + PromptTab.BOT_ASKS;
        });
      }
      break;
    case Direction.Down:
      if (currentElement.tab === PromptTab.USER_INPUT) {
        candidateElements = elements.filter(function (ele) {
          return ele.tab !== PromptTab.OTHER;
        });
      }
      break;
    case Direction.Left:
      if (currentElement.tab === PromptTab.OTHER) {
        candidateElements = elements.filter(function (ele) {
          return ele.tab === PromptTab.USER_INPUT;
        });
      }
      break;
    case Direction.Right:
      if (!currentElement.tab) {
        candidateElements = elements.filter(function (ele) {
          return ele.tab !== PromptTab.OTHER;
        });
      } else if (currentElement.tab === PromptTab.BOT_ASKS || currentElement.tab === PromptTab.USER_INPUT) {
        candidateElements = elements.filter(function (ele) {
          return ele.selectedId === '' + currentElement.focusedId + PromptTab.OTHER;
        });
      }
      break;
    default:
      candidateElements = elements;
  }
  return candidateElements;
}
function handleNextMoveFilter(currentElement, elements) {
  var currentElementSelectors = parseSelector(transformDefaultBranch(currentElement.selectedId));
  return elements.filter(function (ele) {
    var eleSelectors = parseSelector(transformDefaultBranch(ele.selectedId));
    var condition1 =
      eleSelectors.length === currentElementSelectors.length &&
      eleSelectors.slice(0, eleSelectors.length - 2).join('.') ===
        currentElementSelectors.slice(0, currentElementSelectors.length - 2).join('.') &&
      Number(eleSelectors[eleSelectors.length - 1]) - 1 <=
        Number(currentElementSelectors[currentElementSelectors.length - 1]);
    var condition2 =
      eleSelectors.length > currentElementSelectors.length &&
      eleSelectors.join('.').includes(currentElementSelectors.join('.')) &&
      Number(eleSelectors[eleSelectors.length - 1]) === 0;
    var condition3 =
      eleSelectors.length < currentElementSelectors.length &&
      Number(eleSelectors[eleSelectors.length - 1]) - 1 === Number(currentElementSelectors[eleSelectors.length - 1]);
    return condition1 || condition2 || condition3;
  });
}
function handlePrevMoveFilter(currentElement, elements) {
  var currentElementSelectors = parseSelector(transformDefaultBranch(currentElement.selectedId));
  return elements.filter(function (ele) {
    var eleSelectors = parseSelector(transformDefaultBranch(ele.selectedId));
    var condition1 =
      eleSelectors.length === currentElementSelectors.length &&
      eleSelectors.slice(0, eleSelectors.length - 2).join('.') ===
        currentElementSelectors.slice(0, currentElementSelectors.length - 2).join('.') &&
      Number(eleSelectors[eleSelectors.length - 1]) + 1 >=
        Number(currentElementSelectors[currentElementSelectors.length - 1]);
    var condition2 =
      eleSelectors.length > currentElementSelectors.length &&
      Number(eleSelectors[currentElementSelectors.length - 1]) - 1 ===
        Number(currentElementSelectors[currentElementSelectors.length - 1]);
    var condition3 =
      eleSelectors.length < currentElementSelectors.length &&
      currentElementSelectors.join('.').includes(eleSelectors.join('.')) &&
      Number(currentElementSelectors[currentElementSelectors.length - 1]) === 0;
    return condition1 || condition2 || condition3;
  });
}
function handleSwitchCasePrevMoveFilter(currentElement, elements) {
  var currentElementSelectors = parseSelector(transformDefaultBranch(currentElement.selectedId));
  var candidateElements = elements;
  var swicthPosition = -1;
  swicthPosition = currentElementSelectors.lastIndexOf('cases');
  var samePath = currentElementSelectors.slice(0, swicthPosition).join('.');
  var sortedElement = elements
    .filter(function (ele) {
      var eleSelectors = parseSelector(transformDefaultBranch(ele.selectedId));
      return (
        eleSelectors.slice(0, swicthPosition).join('.') === samePath &&
        Number(eleSelectors[swicthPosition + 1]) <= Number(currentElementSelectors[swicthPosition + 1])
      );
    })
    .sort(function (ele1, ele2) {
      var eleSelectors1 = parseSelector(transformDefaultBranch(ele1.selectedId));
      var eleSelectors2 = parseSelector(transformDefaultBranch(ele2.selectedId));
      return Number(eleSelectors2[swicthPosition + 1]) - Number(eleSelectors1[swicthPosition + 1]);
    });
  var minSwitchCasesElement = parseSelector(transformDefaultBranch(sortedElement[0].selectedId));
  var minSwitchCasesIndex = Number(minSwitchCasesElement[swicthPosition + 1]);
  candidateElements = elements.filter(function (ele) {
    var eleSelectors = parseSelector(transformDefaultBranch(ele.selectedId));
    return Number(eleSelectors[swicthPosition + 1]) === minSwitchCasesIndex;
  });
  return candidateElements;
}
function handleSwitchCaseNextMoveFilter(currentElement, elements) {
  var currentElementSelectors = parseSelector(transformDefaultBranch(currentElement.selectedId));
  var candidateElements = elements;
  var swicthPosition = -1;
  if (currentElementSelectors.lastIndexOf('default') > currentElementSelectors.lastIndexOf('cases')) {
    swicthPosition = currentElementSelectors.lastIndexOf('default');
  } else {
    swicthPosition = currentElementSelectors.lastIndexOf('cases');
  }
  var samePath = currentElementSelectors.slice(0, swicthPosition).join('.');
  var sortedElement = elements
    .filter(function (ele) {
      var eleSelectors = parseSelector(transformDefaultBranch(ele.selectedId));
      return (
        eleSelectors.slice(0, swicthPosition).join('.') === samePath &&
        Number(eleSelectors[swicthPosition + 1]) >= Number(currentElementSelectors[swicthPosition + 1])
      );
    })
    .sort(function (ele1, ele2) {
      var eleSelectors1 = parseSelector(transformDefaultBranch(ele1.selectedId));
      var eleSelectors2 = parseSelector(transformDefaultBranch(ele2.selectedId));
      return Number(eleSelectors1[swicthPosition + 1]) - Number(eleSelectors2[swicthPosition + 1]);
    });
  var minSwitchCasesElement = parseSelector(transformDefaultBranch(sortedElement[0].selectedId));
  var minSwitchCasesIndex = Number(minSwitchCasesElement[swicthPosition + 1]);
  candidateElements = elements.filter(function (ele) {
    var eleSelectors = parseSelector(transformDefaultBranch(ele.selectedId));
    return Number(eleSelectors[swicthPosition + 1]) === minSwitchCasesIndex;
  });
  return candidateElements;
}
export function filterElementBySchema(currentElement, elements, direction) {
  var currentElementSelectors = parseSelector(transformDefaultBranch(currentElement.selectedId));
  var candidateElements = elements;
  switch (direction) {
    case Direction.Up: {
      candidateElements = handlePrevMoveFilter(currentElement, elements);
      break;
    }
    case Direction.Down: {
      candidateElements = handleNextMoveFilter(currentElement, elements);
      break;
    }
    case Direction.Left: {
      if (currentElementSelectors.lastIndexOf('cases') > -1) {
        candidateElements = handleSwitchCasePrevMoveFilter(currentElement, elements);
      } else {
        candidateElements = handlePrevMoveFilter(currentElement, elements);
      }
      break;
    }
    case Direction.Right: {
      if (currentElementSelectors.lastIndexOf('default') > -1 || currentElementSelectors.lastIndexOf('cases') > -1) {
        candidateElements = handleSwitchCaseNextMoveFilter(currentElement, elements);
      } else {
        candidateElements = handleNextMoveFilter(currentElement, elements);
      }
      break;
    }
  }
  return candidateElements;
}
//# sourceMappingURL=calculateBySchema.js.map
