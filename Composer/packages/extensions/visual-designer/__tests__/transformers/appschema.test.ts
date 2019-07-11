import { DialogGroup, dialogGroups, getDialogGroupByType } from '../../src/shared/appschema';

test("DialogGroup shouldn't contain duplicate values", () => {
  const valueMap = {};
  Object.values(DialogGroup).forEach(x => (valueMap[x] = true));
  expect(Object.keys(DialogGroup).length).toEqual(Object.keys(valueMap).length);
});

test("DialogGroup's keys should be matched with values", () => {
  Object.keys(DialogGroup).forEach(key => {
    expect(DialogGroup[key].indexOf(key) > -1).toBeTruthy();
  });
});

test("dialogGroups shouldn't contain duplicate keys", () => {
  const keyMap = {};
  Object.keys(dialogGroups).forEach(x => (keyMap[x] = true));
  expect(Object.keys(dialogGroups).length).toEqual(Object.keys(keyMap).length);
});

test("dialogGroups value should contain 'label' and 'types' properties", () => {
  const keyMap = { label: 0, types: 0 };
  Object.values(dialogGroups).forEach(x => {
    Object.keys(x).forEach(y => {
      keyMap[y]++;
    });
  });
  expect(Object.keys(dialogGroups).length).toEqual(keyMap.label);
  expect(Object.keys(dialogGroups).length).toEqual(keyMap.types);
});

describe('getDialogGroupByType', () => {
  test("should return DialogGroup key when input a type belongs to [INPUT, RESPONSE, BRANCHING, RULE] dialogGroup types or input 'Condition'", () => {
    expect(getDialogGroupByType('Microsoft.TextInput')).toEqual(DialogGroup.INPUT);
    expect(getDialogGroupByType('Microsoft.IfCondition')).toEqual(DialogGroup.STEP);
    expect(getDialogGroupByType('Microsoft.SendActivity')).toEqual(DialogGroup.RESPONSE);
    expect(getDialogGroupByType('Microsoft.EventRule')).toEqual(DialogGroup.RULE);
  });
  test('should return DialogGroup.OTHER when input a type not belongs to [INPUT, RESPONSE, BRANCHING, RULE] dialogGroup types', () => {
    expect(getDialogGroupByType('Microsoft.HttpRequest')).toEqual(DialogGroup.OTHER);
  });
});
