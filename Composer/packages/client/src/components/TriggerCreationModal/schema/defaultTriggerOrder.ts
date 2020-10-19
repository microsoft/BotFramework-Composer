// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const defaultTriggerOrder = [
  'Intent recognized',
  'QnA Intent recognized',
  'Unknown intent',
  'Dialog events',
  'Activities',
  'Duplicated intents recognized',
  'Custom events',
];

export const triggerOrderMap: { [label: string]: number } = defaultTriggerOrder.reduce((result, label, index) => {
  result[label] = index;
  return result;
}, {});
