// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveKinds } from '../../../src/adaptive-flow-renderer/constants/AdaptiveKinds';

test("ObiTypes shoudn't contain duplicate values", () => {
  const valueMap = {};
  Object.values(AdaptiveKinds).forEach((x) => (valueMap[x] = true));
  expect(Object.keys(AdaptiveKinds).length).toEqual(Object.keys(valueMap).length);
});

test("ObiTypes's keys should be matched with values", () => {
  Object.keys(AdaptiveKinds).forEach((key) => {
    expect(AdaptiveKinds[key].indexOf(key) > -1).toBeTruthy();
  });
});
