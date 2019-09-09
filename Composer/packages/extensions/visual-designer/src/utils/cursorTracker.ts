import { ObiTypes } from '../constants/ObiTypes';
import { ObiFieldNames } from '../constants/ObiFieldNames';
import { KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';

import { locateNode } from './jsonTracker';

const { Actions, ElseActions, Condition, DefaultCase, Cases } = ObiFieldNames;

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
    const { parentPath, parentKey, parentData } = locateParentNode(inputDialog, targetPath);
    if (parentPath) {
      switch (parentData.$type) {
        case ObiTypes.OnBeginDialog:
        case ObiTypes.OnIntent:
        case ObiTypes.OnUnknownIntent:
        case ObiTypes.OnEvent:
        case ObiTypes.OnConversationUpdateActivity:
          return '';
        default:
          targetPath = locateParentNode(inputDialog, parentPath).parentPathWithStep + `[${parentKey + 1}]`;
          return locateNextPath(inputDialog, targetPath);
      }
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
      if (currentData[Actions] && currentData[Actions].length > 0) {
        resultPath = locatePreviousPath(inputDialog, resultPath + `.${Actions}[${currentData[Actions].length - 1}]`);
      } else if (currentData[ElseActions] && currentData[ElseActions].length > 0) {
        resultPath = locatePreviousPath(
          inputDialog,
          resultPath + `.${ElseActions}[${currentData[ElseActions].length - 1}]`
        );
      }
      break;
    case ObiTypes.SwitchCondition:
      if (currentData[DefaultCase] && currentData[DefaultCase].length > 0) {
        resultPath = locatePreviousPath(
          inputDialog,
          resultPath + `.${DefaultCase}[${currentData[DefaultCase].length - 1}]`
        );
      } else if (currentData[Cases] && currentData[Cases].length > 0) {
        let findChild = false;
        currentData[Cases].forEach((switchCase, index) => {
          if (!findChild && switchCase[Actions] && switchCase[Actions].length > 0) {
            resultPath = locatePreviousPath(
              inputDialog,
              resultPath + `.${Cases}[${index}].${Actions}[${switchCase[Actions].length - 1}]`
            );
            findChild = true;
          }
        });
      }
      break;
    case ObiTypes.Foreach:
    case ObiTypes.ForeachPage:
      if (currentData[Actions] && currentData[Actions].length > 0) {
        resultPath = locatePreviousPath(inputDialog, resultPath + `.${Actions}[${currentData[Actions].length - 1}]`);
      }
      break;
    case ObiTypes.OnBeginDialog:
    case ObiTypes.OnIntent:
    case ObiTypes.OnUnknownIntent:
    case ObiTypes.OnEvent:
    case ObiTypes.OnConversationUpdateActivity:
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
  let lastIndexOfactions = 0;
  const lastIndexOfBracket = path.lastIndexOf('[');
  const parentPathWithStep = path.substr(0, lastIndexOfBracket);

  if (path.includes(Cases)) {
    lastIndexOfactions = path.lastIndexOf(`.${Cases}`);
    parentPath = path.substr(0, lastIndexOfactions);
  } else {
    lastIndexOfactions = path.lastIndexOf('.');
    parentPath = path.substr(0, lastIndexOfactions);
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
          if (currentData[Actions] && currentData[Actions].length > 0) {
            resultPath += `.${Actions}[0]`;
          } else if (currentData[ElseActions] && currentData[ElseActions].length > 0) {
            resultPath += `.${ElseActions}[0]`;
          } else {
            resultPath = locateNextPath(inputDialog, parentPathWithStep + `[${currentKey + 1}]`) || path;
          }
          break;
        case ObiTypes.SwitchCondition:
          if (currentData[DefaultCase] && currentData[DefaultCase].length > 0) {
            resultPath += `.${DefaultCase}[0]`;
          } else if (currentData[Cases] && currentData[Cases].length > 0) {
            let findChild = false;
            currentData[Cases].forEach((switchCase, index) => {
              if (!findChild && switchCase[Actions] && switchCase[Actions].length > 0) {
                resultPath += `.${Cases}[${index}].${Actions}[0]`;
                findChild = true;
              }
            });
          } else {
            resultPath = locateNextPath(inputDialog, parentPathWithStep + `[${currentKey + 1}]`) || path;
          }
          break;
        case ObiTypes.Foreach:
        case ObiTypes.ForeachPage:
        case ObiTypes.OnBeginDialog:
        case ObiTypes.OnIntent:
        case ObiTypes.OnUnknownIntent:
        case ObiTypes.OnEvent:
        case ObiTypes.OnConversationUpdateActivity:
          if (currentData[Actions] && currentData[Actions].length > 0) {
            resultPath += `.${Actions}[0]`;
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
          if (parentData[Actions] && parentData[Actions].length > 0) {
            if (parentData[Actions].length > currentKey) {
              resultPath = parentPath + `.${Actions}[${currentKey}]`;
            } else {
              resultPath = parentPath + `.${Actions}[${parentData[Actions].length - 1}]`;
            }
          }
          break;
        case ObiTypes.SwitchCondition:
          if (parentData[Cases].length > 0) {
            const lastStepPath = path.substr(parentPath.length);

            if (lastStepPath.includes(Cases)) {
              const leftBracketPosition = lastStepPath.indexOf('[');
              const rightBracketPosition = lastStepPath.indexOf(']');
              const caseSelector = Number(
                lastStepPath.substr(leftBracketPosition + 1, rightBracketPosition - leftBracketPosition - 1)
              );
              let findChild = false;
              let switchCase: { [key: string]: any };
              for (let index = caseSelector - 1; index >= 0; index--) {
                switchCase = parentData[Cases][index];
                if (!findChild && switchCase[Actions] && switchCase[Actions].length > 0 && index < caseSelector) {
                  if (switchCase[Actions].length > currentKey) {
                    resultPath = parentPath + `.${Cases}[${index}].${Actions}[${currentKey}]`;
                    findChild = true;
                  } else {
                    resultPath = parentPath + `.${Cases}[${index}].${Actions}[${switchCase[Actions].length - 1}]`;
                    findChild = true;
                  }
                }
              }
              if (parentData[DefaultCase] && parentData[DefaultCase].length > 0 && !findChild) {
                if (parentData[DefaultCase].length > currentKey) {
                  resultPath = parentPath + `.${DefaultCase}[${currentKey}]`;
                } else {
                  resultPath = parentPath + `.${DefaultCase}[${parentData[DefaultCase].length - 1}]`;
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
          if (parentData[ElseActions] && parentData[ElseActions].length > 0) {
            if (parentData[ElseActions].length > currentKey) {
              resultPath = parentPath + `.${ElseActions}[${currentKey}]`;
            } else {
              resultPath = parentPath + `.${ElseActions}[${parentData[ElseActions].length - 1}]`;
            }
          }
          break;
        case ObiTypes.SwitchCondition:
          if (parentData[Cases].length > 0) {
            const lastStepPath = path.substr(parentPath.length);
            let findChild = false;
            let switchCase: { [key: string]: any };

            if (lastStepPath.includes(Cases)) {
              const leftBracketPosition = lastStepPath.indexOf('[');
              const rightBracketPosition = lastStepPath.indexOf(']');
              const caseSelector = Number(
                lastStepPath.substr(leftBracketPosition + 1, rightBracketPosition - leftBracketPosition - 1)
              );
              for (let index = caseSelector + 1; index < parentData[Cases].length; index++) {
                switchCase = parentData[Cases][index];
                if (!findChild && switchCase[Actions] && switchCase[Actions].length > 0 && index > caseSelector) {
                  if (switchCase[Actions].length > currentKey) {
                    resultPath = parentPath + `.${Cases}[${index}].${Actions}[${currentKey}]`;
                    findChild = true;
                  } else {
                    resultPath = parentPath + `.${Cases}[${index}].${Actions}[${switchCase[Actions].length - 1}]`;
                    findChild = true;
                  }
                }
              }
            } else {
              for (let index = 0; index < parentData[Cases].length; index++) {
                switchCase = parentData[Cases][index];
                if (!findChild && switchCase[Actions] && switchCase[Actions].length > 0) {
                  if (switchCase[Actions].length > currentKey) {
                    resultPath = parentPath + `.${Cases}[${index}].${Actions}[${currentKey}]`;
                    findChild = true;
                  } else {
                    resultPath = parentPath + `.${Cases}[${index}].${Actions}[${switchCase[Actions].length - 1}]`;
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
