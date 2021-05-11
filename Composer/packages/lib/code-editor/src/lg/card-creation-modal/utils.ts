// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const adaptiveCardRegex = /-\s*\$\{\s*.*(\{[\s\S]*)\}\s*/;

export const getAdaptiveCard = (templateBody: string): Record<string, unknown> | undefined => {
  return JSON.parse(adaptiveCardRegex.exec(templateBody)?.[1] || '{}');
};

const start = '- ${';
const end = '}';

export const toJsonTemplate = (card: object): string => {
  return `${start}${JSON.stringify(card || {}, null, 2)}${end}`;
};
