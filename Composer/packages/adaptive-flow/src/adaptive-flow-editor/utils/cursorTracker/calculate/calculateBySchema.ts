// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PromptTab } from '@bfc/shared';

import { SelectorElement, Direction } from '../type';
function parseSelector(path: string): null | string[] {
  if (!path) return null;

  const selectors = path.split('.');
  if (selectors.length === 0) {
    return null;
  }

  if (selectors[0] === '$' || selectors[0] === '') {
    selectors.shift();
  }

  const normalizedSelectors = selectors.reduce((result, selector) => {
    // e.g. actions[0]
    const parseResult = /(\w+)\[(-\d+|\d+)\]/.exec(selector);

    if (parseResult) {
      const [, objSelector, arraySelector] = parseResult;
      const arrayIndex = parseInt(arraySelector);
      result.push(objSelector, arrayIndex);
    } else {
      result.push(selector);
    }

    return result;
  }, [] as any[]);

  return normalizedSelectors;
}
function transformDefaultBranch(path) {
  return path.replace(new RegExp('default', 'g'), 'default[-1].actions');
}
export function filterPromptElementsBySchema(
  currentElement: SelectorElement,
  elements: SelectorElement[],
  direction: Direction
): SelectorElement[] {
  let candidateElements: SelectorElement[] = elements;

  switch (direction) {
    case Direction.Up:
      if (currentElement.tab === PromptTab.OTHER || currentElement.tab === PromptTab.USER_INPUT) {
        candidateElements = elements.filter(
          (ele) => ele.selectedId === `${currentElement.focusedId}${PromptTab.BOT_ASKS}`
        );
      }
      break;
    case Direction.Down:
      if (currentElement.tab === PromptTab.USER_INPUT) {
        candidateElements = elements.filter((ele) => ele.tab !== PromptTab.OTHER);
      }
      break;
    case Direction.Left:
      if (currentElement.tab === PromptTab.OTHER) {
        candidateElements = elements.filter((ele) => ele.tab === PromptTab.USER_INPUT);
      }
      break;
    case Direction.Right:
      if (!currentElement.tab) {
        candidateElements = elements.filter((ele) => ele.tab !== PromptTab.OTHER);
      } else if (currentElement.tab === PromptTab.BOT_ASKS || currentElement.tab === PromptTab.USER_INPUT) {
        candidateElements = elements.filter(
          (ele) => ele.selectedId === `${currentElement.focusedId}${PromptTab.OTHER}`
        );
      }
      break;
    default:
      candidateElements = elements;
  }
  return candidateElements;
}

function handleNextMoveFilter(currentElement: SelectorElement, elements: SelectorElement[]): SelectorElement[] {
  const currentElementSelectors = parseSelector(transformDefaultBranch(currentElement.selectedId)) as string[];
  return elements.filter((ele) => {
    const eleSelectors = parseSelector(transformDefaultBranch(ele.selectedId)) as string[];
    const condition1 =
      eleSelectors.length === currentElementSelectors.length &&
      eleSelectors.slice(0, eleSelectors.length - 2).join('.') ===
        currentElementSelectors.slice(0, currentElementSelectors.length - 2).join('.') &&
      Number(eleSelectors[eleSelectors.length - 1]) - 1 <=
        Number(currentElementSelectors[currentElementSelectors.length - 1]);
    const condition2 =
      eleSelectors.length > currentElementSelectors.length &&
      eleSelectors.join('.').includes(currentElementSelectors.join('.')) &&
      Number(eleSelectors[eleSelectors.length - 1]) === 0;
    const condition3 =
      eleSelectors.length < currentElementSelectors.length &&
      Number(eleSelectors[eleSelectors.length - 1]) - 1 === Number(currentElementSelectors[eleSelectors.length - 1]);
    return condition1 || condition2 || condition3;
  });
}

function handlePrevMoveFilter(currentElement: SelectorElement, elements: SelectorElement[]): SelectorElement[] {
  const currentElementSelectors = parseSelector(transformDefaultBranch(currentElement.selectedId)) as string[];
  return elements.filter((ele) => {
    const eleSelectors = parseSelector(transformDefaultBranch(ele.selectedId)) as string[];
    const condition1 =
      eleSelectors.length === currentElementSelectors.length &&
      eleSelectors.slice(0, eleSelectors.length - 2).join('.') ===
        currentElementSelectors.slice(0, currentElementSelectors.length - 2).join('.') &&
      Number(eleSelectors[eleSelectors.length - 1]) + 1 >=
        Number(currentElementSelectors[currentElementSelectors.length - 1]);
    const condition2 =
      eleSelectors.length > currentElementSelectors.length &&
      Number(eleSelectors[currentElementSelectors.length - 1]) - 1 ===
        Number(currentElementSelectors[currentElementSelectors.length - 1]);
    const condition3 =
      eleSelectors.length < currentElementSelectors.length &&
      currentElementSelectors.join('.').includes(eleSelectors.join('.')) &&
      Number(currentElementSelectors[currentElementSelectors.length - 1]) === 0;
    return condition1 || condition2 || condition3;
  });
}

function handleSwitchCasePrevMoveFilter(
  currentElement: SelectorElement,
  elements: SelectorElement[]
): SelectorElement[] {
  const currentElementSelectors = parseSelector(transformDefaultBranch(currentElement.selectedId)) as string[];
  let swicthPosition = -1;
  swicthPosition = currentElementSelectors.lastIndexOf('cases');
  const samePath = currentElementSelectors.slice(0, swicthPosition).join('.');
  const sortedElement = elements
    .filter((ele) => {
      const eleSelectors = parseSelector(transformDefaultBranch(ele.selectedId)) as string[];
      return (
        eleSelectors.slice(0, swicthPosition).join('.') === samePath &&
        Number(eleSelectors[swicthPosition + 1]) <= Number(currentElementSelectors[swicthPosition + 1])
      );
    })
    .sort((ele1, ele2) => {
      const eleSelectors1 = parseSelector(transformDefaultBranch(ele1.selectedId)) as string[];
      const eleSelectors2 = parseSelector(transformDefaultBranch(ele2.selectedId)) as string[];
      return Number(eleSelectors2[swicthPosition + 1]) - Number(eleSelectors1[swicthPosition + 1]);
    });
  const minSwitchCasesElement = parseSelector(transformDefaultBranch(sortedElement[0].selectedId)) as string[];
  const minSwitchCasesIndex = Number(minSwitchCasesElement[swicthPosition + 1]);
  const candidateElements = elements.filter((ele) => {
    const eleSelectors = parseSelector(transformDefaultBranch(ele.selectedId)) as string[];
    return Number(eleSelectors[swicthPosition + 1]) === minSwitchCasesIndex;
  });
  return candidateElements;
}

function handleSwitchCaseNextMoveFilter(currentElement: SelectorElement, elements: SelectorElement[]) {
  const currentElementSelectors = parseSelector(transformDefaultBranch(currentElement.selectedId)) as string[];
  let swicthPosition = -1;
  if (currentElementSelectors.lastIndexOf('default') > currentElementSelectors.lastIndexOf('cases')) {
    swicthPosition = currentElementSelectors.lastIndexOf('default');
  } else {
    swicthPosition = currentElementSelectors.lastIndexOf('cases');
  }
  const samePath = currentElementSelectors.slice(0, swicthPosition).join('.');
  const sortedElement = elements
    .filter((ele) => {
      const eleSelectors = parseSelector(transformDefaultBranch(ele.selectedId)) as string[];
      return (
        eleSelectors.slice(0, swicthPosition).join('.') === samePath &&
        Number(eleSelectors[swicthPosition + 1]) >= Number(currentElementSelectors[swicthPosition + 1])
      );
    })
    .sort((ele1, ele2) => {
      const eleSelectors1 = parseSelector(transformDefaultBranch(ele1.selectedId)) as string[];
      const eleSelectors2 = parseSelector(transformDefaultBranch(ele2.selectedId)) as string[];
      return Number(eleSelectors1[swicthPosition + 1]) - Number(eleSelectors2[swicthPosition + 1]);
    });
  const minSwitchCasesElement = parseSelector(transformDefaultBranch(sortedElement[0].selectedId)) as string[];
  const minSwitchCasesIndex = Number(minSwitchCasesElement[swicthPosition + 1]);
  const candidateElements = elements.filter((ele) => {
    const eleSelectors = parseSelector(transformDefaultBranch(ele.selectedId)) as string[];
    return Number(eleSelectors[swicthPosition + 1]) === minSwitchCasesIndex;
  });
  return candidateElements;
}

export function filterElementBySchema(
  currentElement: SelectorElement,
  elements: SelectorElement[],
  direction: Direction
) {
  const currentElementSelectors = parseSelector(transformDefaultBranch(currentElement.selectedId)) as string[];
  let candidateElements = elements;
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
