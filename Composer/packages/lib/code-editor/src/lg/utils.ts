// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const adaptiveCardRegex = /-\s*```({\s*[\s\S]*})\s*```/;

export const getAdaptiveCard = (templateBody?: string): Record<string, unknown> | undefined => {
  if (templateBody) {
    const card = adaptiveCardRegex.exec(templateBody);
    if (card) {
      return JSON.parse(card[1]);
    }
  }
};

const start = '- ```';
const end = '```';

export const convertToLgString = (card: object): string => {
  return `${start}${JSON.stringify(card || {}, null, 2)}${end}`;
};
