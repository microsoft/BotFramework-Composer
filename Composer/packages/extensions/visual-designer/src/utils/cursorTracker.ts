import { ObiTypes } from '../constants/ObiTypes';
import { KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';

import { locateNode } from './jsonTracker';

// locate the next path
function locateNextPath(inputDialog: { [key: string]: any }, path: string): string {
  let targetPath = path;
  const target = locateNode(inputDialog, targetPath);
  /**
   * if target exits return targetPath
   * else locating next path in parent level
   *  */

  if (target) {
    return targetPath;
  } else {
    const { parentPath, parentKey } = locateParentNode(inputDialog, targetPath);
    if (parentPath) {
      targetPath = locateParentNode(inputDialog, parentPath).parentPathWithStep + `[${parentKey + 1}]`;
      return locateNextPath(inputDialog, targetPath);
    } else {
      return '';
    }
  }
}

// get the previous path
function locatePreviousPath(inputDialog: { [key: string]: any }, path: string): string {
  const target = locateNode(inputDialog, path);
  if (!target) return '';
  const currentData = target.currentData;
  const targetObiType = target.currentData.$type;
  let resultPath = path;
  /**
   * locate previous path based on target type
   */
  switch (targetObiType) {
    case ObiTypes.IfCondition:
      if (currentData.steps && currentData.steps.length > 0) {
        resultPath = locatePreviousPath(inputDialog, resultPath + `.steps[${currentData.steps.length - 1}]`);
      } else if (currentData.elseSteps && currentData.elseSteps.length > 0) {
        resultPath = locatePreviousPath(inputDialog, resultPath + `.elseSteps[${currentData.elseSteps.length - 1}]`);
      }
      break;
    case ObiTypes.SwitchCondition:
      if (currentData.default && currentData.default.length > 0) {
        resultPath = locatePreviousPath(inputDialog, resultPath + `.default[${currentData.default.length - 1}]`);
      } else if (currentData.cases && currentData.cases.length > 0) {
        let findChild = false;
        currentData.cases.forEach((switchCase, index) => {
          if (!findChild && switchCase.steps && switchCase.steps.length > 0) {
            resultPath = locatePreviousPath(
              inputDialog,
              resultPath + `.cases[${index}].steps[${switchCase.steps.length - 1}]`
            );
            findChild = true;
          }
        });
      }
      break;
    case ObiTypes.Foreach:
    case ObiTypes.ForeachPage:
      if (currentData.steps && currentData.steps.length > 0) {
        resultPath = locatePreviousPath(inputDialog, resultPath + `.steps[${currentData.steps.length - 1}]`);
      }
      break;
    case ObiTypes.IntentRule:
    case ObiTypes.UnknownIntentRule:
    case ObiTypes.EventRule:
    case ObiTypes.ConversationUpdateActivityRule:
      resultPath = '';
      break;
    default:
      break;
  }
  return resultPath;
}

// locate the parent node corresponding to the path
function locateParentNode(inputDialog: { [key: string]: any }, path: string): { [key: string]: any } {
  let parentPath;
  let lastIndexOfSteps = 0;
  const lastIndexOfBracket = path.lastIndexOf('[');
  const parentPathWithStep = path.substr(0, lastIndexOfBracket);

  if (path.includes('cases')) {
    lastIndexOfSteps = path.lastIndexOf('.cases');
    parentPath = path.substr(0, lastIndexOfSteps);
  } else {
    lastIndexOfSteps = path.lastIndexOf('.');
    parentPath = path.substr(0, lastIndexOfSteps);
  }
  const parentTarget = locateNode(inputDialog, parentPath);
  const parentData = parentTarget ? parentTarget.currentData : {};
  const parentKey = parentTarget ? parentTarget.currentKey : null;

  return { parentData, parentPath, parentPathWithStep, parentKey };
}

// get the focused node after the cursor has moved
export function moveCursor(inputDialog: { [key: string]: any }, path: string, action: string): string {
  const target = locateNode(inputDialog, path);
  if (!target) return path;
  const currentData = target.currentData;
  const currentKey = target.currentKey as number;
  const targetObiType = target.currentData.$type;
  let resultPath = path;
  const { parentData, parentPath, parentPathWithStep } = locateParentNode(inputDialog, path);
  const parentTargetObiType = parentData.$type;
  switch (action) {
    case KeyboardCommandTypes.MoveUp:
      if (currentKey === 0) {
        resultPath = parentPath || path;
      } else if (currentKey > 0) {
        resultPath = locatePreviousPath(inputDialog, parentPathWithStep + `[${currentKey - 1}]`) || path;
      }
      break;
    case KeyboardCommandTypes.MoveDown:
      switch (targetObiType) {
        case ObiTypes.IfCondition:
          if (currentData.steps && currentData.steps.length > 0) {
            resultPath += '.steps[0]';
          } else if (currentData.elseSteps && currentData.elseSteps.length > 0) {
            resultPath += '.elseSteps[0]';
          } else {
            resultPath = locateNextPath(inputDialog, parentPathWithStep + `[${currentKey + 1}]`) || path;
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
            resultPath = locateNextPath(inputDialog, parentPathWithStep + `[${currentKey + 1}]`) || path;
          }
          break;
        case ObiTypes.Foreach:
        case ObiTypes.ForeachPage:
        case ObiTypes.IntentRule:
        case ObiTypes.UnknownIntentRule:
        case ObiTypes.EventRule:
        case ObiTypes.ConversationUpdateActivityRule:
          if (currentData.steps && currentData.steps.length > 0) {
            resultPath += '.steps[0]';
          } else {
            resultPath = locateNextPath(inputDialog, parentPathWithStep + `[${currentKey + 1}]`) || path;
          }
          break;
        default:
          resultPath = locateNextPath(inputDialog, parentPathWithStep + `[${currentKey + 1}]`) || path;
          break;
      }
      break;
    case KeyboardCommandTypes.MoveLeft:
      if (!parentTargetObiType) break;
      switch (parentTargetObiType) {
        case ObiTypes.IfCondition:
          if (parentData.steps && parentData.steps.length > 0) {
            if (parentData.steps.length > currentKey) {
              resultPath = parentPath + `.steps[${currentKey}]`;
            } else {
              resultPath = parentPath + `.steps[${parentData.steps.length - 1}]`;
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
    case KeyboardCommandTypes.MoveRight:
      if (!parentTargetObiType) break;
      switch (parentTargetObiType) {
        case ObiTypes.IfCondition:
          if (parentData.elseSteps && parentData.elseSteps.length > 0) {
            if (parentData.elseSteps.length > currentKey) {
              resultPath = parentPath + `.elseSteps[${currentKey}]`;
            } else {
              resultPath = parentPath + `.elseSteps[${parentData.elseSteps.length - 1}]`;
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
