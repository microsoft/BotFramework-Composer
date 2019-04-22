import { ObiTypes } from '../../src/transformers/constants/ObiTypes';

test("ObiTypes shoudn't contain duplicate values", () => {
  const valueMap = {};
  Object.values(ObiTypes).forEach(x => (valueMap[x] = true));
  expect(Object.keys(ObiTypes).length).toEqual(Object.keys(valueMap).length);
});

test("ObiTypes's keys should be matched with values", () => {
  Object.keys(ObiTypes).forEach(key => {
    expect(ObiTypes[key].indexOf(key) > -1).toBeTruthy();
  });
});
