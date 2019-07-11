import { get, set, cloneDeep, replace, has } from 'lodash';

import { JsonWalk } from './jsonWalk';

export function getDialogName(path) {
  const realPath = replace(path, '#.', '#');
  const [dialogName] = realPath.split('#');

  return dialogName;
}

export function getDialogData(dialogsMap, path) {
  if (path === '') return '';
  const realPath = replace(path, '#.', '#');
  const pathList = realPath.split('#');
  const dialog = dialogsMap[pathList[0]];

  if (pathList[1] === '') {
    return dialog;
  }

  return get(dialog, pathList[1]);
}

export function setDialogData(dialogsMap, path, data) {
  const dialogsMapClone = cloneDeep(dialogsMap);
  const realPath = replace(path, '#.', '#');
  const pathList = realPath.split('#');
  const dialog = dialogsMapClone[pathList[0]];

  if (pathList[1] === '') {
    return data;
  }
  return set(dialog, pathList[1], data);
}

export function sanitizeDialogData(dialogData) {
  if (dialogData === null || dialogData === '') {
    return undefined;
  }

  if (Array.isArray(dialogData)) {
    return dialogData.length > 0 ? dialogData.map(sanitizeDialogData).filter(Boolean) : undefined;
  }

  if (typeof dialogData === 'object') {
    const obj = cloneDeep(dialogData); // Prevent mutation of source object.

    for (const key in obj) {
      if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
        delete obj[key];
        continue;
      }

      const result = sanitizeDialogData(obj[key]);
      switch (typeof result) {
        case 'undefined':
          delete obj[key];
          break;
        case 'boolean':
          obj[key] = result;
          break;
        case 'object':
          if (Object.keys(result).length === 0) {
            delete obj[key];
          } else {
            obj[key] = result;
          }
          break;
        default:
          obj[key] = result;
      }
    }

    if (Object.keys(obj).length === 0) {
      return undefined;
    }

    return obj;
  }

  return dialogData;
}

const _RequireChecker = (path, node, rule) => {
  const fieldName = rule.Name;
  if (rule.IsRequired) {
    if (has(node, fieldName) === false) {
      throw new Error(`Missing Required field at "${path}.${fieldName}"`);
    }
  }
};

const _TypeChecker = (path, node, rule) => {
  const fieldName = rule.Name;
  if (rule.Type && has(node, fieldName)) {
    if ((typeof node[fieldName] === 'string' && rule.Type === String) || node[fieldName] instanceof rule.Type) {
      return 0;
    }
    throw new Error(`Type error at "${path}.${fieldName}"`);
  }
};

/**
 * Dialog Validation Rules
 */
const DialogRules = [
  {
    $type: 'Microsoft.IfCondition',
    Fields: [
      {
        Name: 'condition',
        IsRequired: true,
        Type: String, // it should be an expression
        Validators: [_RequireChecker, _TypeChecker],
      },
      {
        Name: 'steps',
        IsRequired: false,
        Type: Array,
        Validators: [_TypeChecker],
      },
    ],
  },
];

export function dialogValidator(dialog) {
  /**
   *
   * @param path , jsonPath string
   * @param value , current node value
   *
   * @return boolean, true to stop walk
   */
  const visitor = (path, value) => {
    // it's a valid schema dialog node.
    if (has(value, '$type')) {
      const matchedRule = DialogRules.find(dr => dr.$type === value.$type);

      if (matchedRule) {
        matchedRule.Fields.forEach(field => {
          field.Validators.forEach(validator => {
            validator(path, value, field);
          });
        });
      }
    }
    return false;
  };

  JsonWalk('$', dialog, visitor);
}
