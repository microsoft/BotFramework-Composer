import { cloneDeep, get, set } from 'lodash';
import nanoid from 'nanoid/generate';
import { seedNewDialog } from 'shared-menus';

import { ObiTypes } from '../constants/ObiTypes';
import { getFriendlyName } from '../components/nodes/utils';
import { KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';

function locateNode(dialog: { [key: string]: any }, path: string) {
  if (!path) return null;

  const selectors = path.split('.');
  if (selectors.length === 0) {
    return null;
  }

  if (selectors[0] === '$') {
    selectors.shift();
  }

  const normalizedSelectors = selectors.reduce(
    (result, selector) => {
      // e.g. steps[0]
      const parseResult = selector.match(/(\w+)\[(\d+)\]/);

      if (parseResult) {
        const [, objSelector, arraySelector] = parseResult;
        const arrayIndex = parseInt(arraySelector);
        result.push(objSelector, arrayIndex);
      } else {
        result.push(selector);
      }

      return result;
    },
    [] as any[]
  );

  // Locate the manipulated json node
  let parentData: object = {};
  let currentKey: number | string = '';
  let currentData = dialog;

  for (const selector of normalizedSelectors) {
    parentData = currentData;
    currentData = parentData[selector];
    currentKey = selector;

    if (currentData === undefined) return null;
  }

  return { parentData, currentData, currentKey };
}

export function queryNode(inputDialog, path) {
  const target = locateNode(inputDialog, path);
  if (!target) return null;

  return target.currentData;
}

export function moveFocusNode(inputDialog, path, action) {
  const target = locateNode(inputDialog, path);
  if (!target) return path;

  const getDownPath = (path: string) => {
    const target = locateNode(inputDialog, path);
    if (!target) return path;
    const currentKey = target.currentKey as number;
    const { parentPath, parentPathWithStep } = getParentData(path);
    let result = path;
    if (locateNode(inputDialog, parentPathWithStep + `[${currentKey + 1}]`)) {
      result = parentPathWithStep + `[${currentKey + 1}]`;
    } else {
      result = getDownPath(parentPath);
    }
    return result;
  };

  const getUpPath = (path: string) => {
    const target = locateNode(inputDialog, path);
    if (!target) return path;
    const currentData = target.currentData;
    const targetObiType = target.currentData.$type;
    let resultPath = path;
    switch (targetObiType) {
      case ObiTypes.IfCondition:
        if (currentData.steps && currentData.steps.length > 0) {
          resultPath = getUpPath(resultPath + `.steps[${currentData.steps.length - 1}]`);
        } else if (currentData.elseSteps && currentData.elseSteps.length > 0) {
          resultPath = getUpPath(resultPath + `.elseSteps[${currentData.elseSteps.length - 1}]`);
        }
        break;
      case ObiTypes.SwitchCondition:
        if (currentData.default && currentData.default.length > 0) {
          resultPath = getUpPath(resultPath + `.default[${currentData.default.length - 1}]`);
        } else if (currentData.cases && currentData.cases.length > 0) {
          let findChild = false;
          currentData.cases.forEach((switchCase, index) => {
            if (!findChild && switchCase.steps && switchCase.steps.length > 0) {
              resultPath = getUpPath(resultPath + `.cases[${index}].steps[${switchCase.steps.length - 1}]`);
              findChild = true;
            }
          });
        }
        break;
      case ObiTypes.Foreach:
      case ObiTypes.ForeachPage:
      case ObiTypes.IntentRule:
      case ObiTypes.UnknownIntentRule:
      case ObiTypes.EventRule:
        if (currentData.steps && currentData.steps.length > 0) {
          resultPath = getUpPath(resultPath + `.steps[${currentData.steps.length - 1}]`);
        }
        break;
      default:
        break;
    }
    return resultPath;
  };

  const getParentData = path => {
    let parentPath, parentPathWithStep;
    let lastIndexOfBracket = 0;
    let lastIndexOfSteps = 0;

    if (path.includes('cases')) {
      lastIndexOfSteps = path.lastIndexOf('.cases');
      parentPath = path.substr(0, lastIndexOfSteps);
    } else {
      lastIndexOfSteps = path.lastIndexOf('.');
      parentPath = path.substr(0, lastIndexOfSteps);
      lastIndexOfBracket = path.lastIndexOf('[');
      parentPathWithStep = path.substr(0, lastIndexOfBracket);
    }
    const parentTarget = locateNode(inputDialog, parentPath);
    const parentData = parentTarget ? parentTarget.currentData : {};
    const parentTargetObiType = parentTarget ? parentTarget.currentData.$type : null;

    return { parentData, parentPath, parentPathWithStep, parentTargetObiType, parentTarget };
  };
  const currentData = target.currentData;
  const currentKey = target.currentKey as number;
  const targetObiType = target.currentData.$type;
  let resultPath = path;
  const { parentData, parentPath, parentPathWithStep, parentTargetObiType } = getParentData(path);
  switch (action) {
    case KeyboardCommandTypes.Up:
      if (currentKey === 0) {
        resultPath = parentPath || path;
      } else if (currentKey > 0) {
        resultPath = getUpPath(parentPathWithStep + `[${currentKey - 1}]`);
      }
      break;
    case KeyboardCommandTypes.Down:
      switch (targetObiType) {
        case ObiTypes.IfCondition:
          if (currentData.steps && currentData.steps.length > 0) {
            resultPath += '.steps[0]';
          } else if (currentData.elseSteps && currentData.elseSteps.length > 0) {
            resultPath += '.elseSteps[0]';
          } else {
            resultPath = getDownPath(path);
          }
          break;
        case ObiTypes.SwitchCondition:
          if (currentData.default && currentData.default.length > 0) {
            resultPath += '.default[0]';
          } else if (currentData.cases && currentData.cases.length > 0) {
            let findChild = false;
            currentData.cases.forEach((switchCase, index) => {
              if (!findChild && switchCase.steps && switchCase.steps.length > 0) {
                resultPath += `.cases[${index}].steps[0]`;
                findChild = true;
              }
            });
          } else {
            resultPath = getDownPath(path) || path;
          }
          break;
        case ObiTypes.Foreach:
        case ObiTypes.ForeachPage:
        case ObiTypes.IntentRule:
        case ObiTypes.UnknownIntentRule:
        case ObiTypes.EventRule:
          if (currentData.steps && currentData.steps.length > 0) {
            resultPath += '.steps[0]';
          } else {
            resultPath = getDownPath(path) || path;
          }
          break;
        default:
          resultPath = getDownPath(path) || path;
          break;
      }
      break;
    case KeyboardCommandTypes.Left:
      if (!parentTargetObiType) break;
      switch (parentTargetObiType) {
        case ObiTypes.IfCondition:
          if (parentData.steps && parentData.steps.length > 0) {
            if (parentData.steps.length > currentKey) {
              resultPath = parentPath + `.steps[${currentKey}]`;
            } else {
              resultPath = parentPath + `steps[${parentData.steps.length - 1}]`;
            }
          }
          break;
        case ObiTypes.SwitchCondition:
          if (parentData.cases.length > 0) {
            const lastStepPath = path.substr(parentPath.length);

            if (lastStepPath.includes('cases')) {
              const leftBracketPosition = lastStepPath.indexOf('[');
              const rightBracketPosition = lastStepPath.indexOf(']');
              const caseSelector = Number(
                lastStepPath.substr(leftBracketPosition + 1, rightBracketPosition - leftBracketPosition - 1)
              );
              let findChild = false;
              let switchCase: { [key: string]: any };
              for (let index = caseSelector - 1; index >= 0; index--) {
                switchCase = parentData.cases[index];
                if (!findChild && switchCase.steps && switchCase.steps.length > 0 && index < caseSelector) {
                  if (switchCase.steps.length > currentKey) {
                    resultPath = parentPath + `.cases[${index}].steps[${currentKey}]`;
                    findChild = true;
                  } else {
                    resultPath = parentPath + `.cases[${index}].steps[${switchCase.steps.length - 1}]`;
                    findChild = true;
                  }
                }
              }
              if (parentData.default && parentData.default.length > 0 && !findChild) {
                if (parentData.default.length > currentKey) {
                  resultPath = parentPath + `.default[${currentKey}]`;
                } else {
                  resultPath = parentPath + `.default[${parentData.default.length - 1}]`;
                }
              }
            }
          }
          break;
      }
      break;
    case KeyboardCommandTypes.Right:
      switch (parentTargetObiType) {
        case ObiTypes.IfCondition:
          if (parentData.elseSteps && parentData.elseSteps.length > 0) {
            if (parentData.elseSteps.length > currentKey) {
              resultPath = parentPath + `.elseSteps[${currentKey}]`;
            } else {
              resultPath = parentPath + `elseSteps[${parentData.elseSteps.length - 1}]`;
            }
          }
          break;
        case ObiTypes.SwitchCondition:
          if (parentData.cases.length > 0) {
            const lastStepPath = path.substr(parentPath.length);
            let findChild = false;
            let switchCase: { [key: string]: any };

            if (lastStepPath.includes('cases')) {
              const leftBracketPosition = lastStepPath.indexOf('[');
              const rightBracketPosition = lastStepPath.indexOf(']');
              const caseSelector = Number(
                lastStepPath.substr(leftBracketPosition + 1, rightBracketPosition - leftBracketPosition - 1)
              );
              for (let index = caseSelector + 1; index < parentData.cases.length; index++) {
                switchCase = parentData.cases[index];
                if (!findChild && switchCase.steps && switchCase.steps.length > 0 && index > caseSelector) {
                  if (switchCase.steps.length > currentKey) {
                    resultPath = parentPath + `.cases[${index}].steps[${currentKey}]`;
                    findChild = true;
                  } else {
                    resultPath = parentPath + `.cases[${index}].steps[${switchCase.steps.length - 1}]`;
                    findChild = true;
                  }
                }
              }
            } else {
              for (let index = 0; index < parentData.cases.length; index++) {
                switchCase = parentData.cases[index];
                if (!findChild && switchCase.steps && switchCase.steps.length > 0) {
                  if (switchCase.steps.length > currentKey) {
                    resultPath = parentPath + `.cases[${index}].steps[${currentKey}]`;
                    findChild = true;
                  } else {
                    resultPath = parentPath + `.cases[${index}].steps[${switchCase.steps.length - 1}]`;
                    findChild = true;
                  }
                }
              }
            }
          }
          break;
      }
      break;
  }
  return resultPath;
}

export function deleteNode(inputDialog, path, callbackOnRemovedData?: (removedData: any) => any) {
  const dialog = cloneDeep(inputDialog);
  const target = locateNode(dialog, path);
  if (!target) return dialog;

  const { parentData, currentData, currentKey } = target;

  const deletedData = cloneDeep(currentData);

  // Remove targetKey
  if (Array.isArray(parentData) && typeof currentKey === 'number') {
    parentData.splice(currentKey, 1);
  } else {
    delete parentData[currentKey];
  }

  // invoke callback handler
  if (callbackOnRemovedData && typeof callbackOnRemovedData === 'function') {
    callbackOnRemovedData(deletedData);
  }

  return dialog;
}

export function insert(inputDialog, path, position, $type) {
  const dialog = cloneDeep(inputDialog);
  const current = get(dialog, path, []);
  const newStep = {
    $type,
    $designer: {
      name: getFriendlyName({ $type }),
      id: nanoid('1234567890', 6),
    },
    ...seedNewDialog($type),
  };

  const insertAt = typeof position === 'undefined' ? current.length : position;

  current.splice(insertAt, 0, newStep);

  set(dialog, path, current);

  return dialog;
}

// insert steps as sibling
export function insertByClipboard(inputDialog, path, clipboardData) {
  const dialog = cloneDeep(inputDialog);
  const target = locateNode(dialog, path);
  if (!target) return {};
  const lastIndexOfSteps = path.lastIndexOf('[');
  const currentPath = path.substr(0, lastIndexOfSteps);
  const current: any[] = get(dialog, currentPath, []);
  const position = Number(target.currentKey) + 1;
  let insertStep;
  const insertSteps: any[] = [];
  clipboardData.forEach(insertId => {
    insertStep = cloneDeep(locateNode(dialog, insertId));
    if (!insertStep) return;
    insertSteps.push(insertStep.currentData);
  });
  current.splice(position, 0, ...insertSteps);
  set(dialog, currentPath, current);
  return { dialog, focusedPath: `${currentPath}[${position}]` };
}
