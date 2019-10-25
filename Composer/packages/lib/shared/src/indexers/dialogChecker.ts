import get from 'lodash.get';
import { ExpressionEngine } from 'botbuilder-expression-parser';

const ExpressionParser = new ExpressionEngine();

interface CheckerFunc {
  (node: { path: string; value: any }): string; // error msg
}

function IsExpression(name: string): CheckerFunc {
  return node => {
    const exp = get(node.value, name);
    if (!exp) return `In ${node.path}: ${node.value.$type}: ${name} is missing or empty`;

    let message = '';
    try {
      ExpressionParser.parse(exp);
    } catch (error) {
      message = `In ${node.path}: ${node.value.$type}: ${name} must be an expression`;
    }
    return message;
  };
}

enum EditArrayChangeTypes {
  Push,
  Pop,
  Take,
  Remove,
  Clear,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EditArrayValueChecker(node: { path: string; value: any }): string {
  let message = '';

  const changeType = get(node.value, 'changeType');

  // when push and remove, value is required
  if (changeType === EditArrayChangeTypes.Push || changeType === EditArrayChangeTypes.Remove) {
    const exp = get(node.value, 'value');
    try {
      ExpressionParser.parse(exp);
    } catch (error) {
      message = `In ${node.path}: ${node.value.$type}: ${name} must be an expression`;
    }
  }

  return message;
}

/**
 * Dialog Validation Rules
 */
// TODO: check field by schema.
export const DialogChecker: { [key: string]: CheckerFunc[] } = {
  'Microsoft.IfCondition': [IsExpression('condition')],
  'Microsoft.SwitchCondition': [IsExpression('condition')],
  'Microsoft.SetProperty': [IsExpression('property'), IsExpression('value')],
  'Microsoft.ForeachPage': [IsExpression('itemsProperty')],
  'Microsoft.Foreach': [IsExpression('itemsProperty')],
  'Microsoft.EditArray': [IsExpression('itemsProperty'), EditArrayValueChecker],
};
