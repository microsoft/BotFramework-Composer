// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable security/detect-unsafe-regex */

export type TemplateBodyItem = {
  kind: 'newline' | 'variation' | 'comment';
  value: string;
};

/**
 * Returns the template kind based on the item text.
 */
const getItemKind = (itemText: string): TemplateBodyItem['kind'] => {
  const firstChar = itemText.charAt(0);
  switch (firstChar) {
    case '>':
      return 'comment';
    case '-':
      return 'variation';
    default:
      return 'newline';
  }
};

/**
 * Cleans up the text of the item based on its kind.
 */
const getItemText = (itemText: string, kind: TemplateBodyItem['kind']) => {
  switch (kind) {
    case 'comment':
      return itemText.replace(/(?<!\\)>/, '').trim();
    case 'variation':
      return itemText.replace(/(?<!\\)-/, '').trim();
    default:
      return '';
  }
};

// This regex can be used to split a template body by newline followed by -, > or another new line
const splitRegex = /\r?\n(?=-|>|\r?\n)/g;
export const parseTemplateBody = (body?: string): TemplateBodyItem[] => {
  /**
   * Split by newline followed by either another new line, or new variation or a comment
   */
  const items = body?.replace(/\r?\n$/g, '')?.split(splitRegex) ?? [];

  let multiLineItem = '';
  const fixedItems: string[] = [];

  /**
   * This block fixes the variations that are multiline and include - or >
   */
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (multiLineItem || item.startsWith('-')) {
      // Check if this item is the start of a multiline variation
      if (/^-( )*```/.test(item)) {
        multiLineItem = item;
        // Check if multiline variation ends in the same line (one line)
        // If yes, it will start keeping track of the multiline variation
        if (/```$/.test(item)) {
          fixedItems.push(multiLineItem);
          multiLineItem = '';
        } else {
          multiLineItem += '\n';
        }
        continue;
      }

      // Check if this item is the end of a multiline variation
      // If yes, it will add the multiline variation into the result array
      if (/```$/.test(item)) {
        multiLineItem += item;
        fixedItems.push(multiLineItem);
        multiLineItem = '';
        continue;
      }

      if (multiLineItem) {
        multiLineItem += `${item}\n`;
      } else {
        fixedItems.push(item);
      }
    } else {
      fixedItems.push(item);
    }
  }

  return fixedItems.map<TemplateBodyItem>((item) => {
    const kind = getItemKind(item);
    const value = getItemText(item, kind);
    return { kind, value };
  });
};

export const templateBodyItemsToString = (items: TemplateBodyItem[]) =>
  items
    .map((item) => {
      switch (item.kind) {
        case 'comment':
          return `> ${item.value}`;
        case 'variation':
          return `- ${item.value}`;
        default:
          return '';
      }
    })
    .join('\n');

const templateNameExtractRegex = /\${(?<templateName>.*)(\(.*\))\s*}/;
const jsonTemplateNameExtractRegex = /\${json\((?<templateName>.*)(\(.*\))\s*}/;

/**
 * Extracts template name from an LG expression
 * ${templateName(params)} => templateName
 * ${json(templateName(params))} => templateName
 * @param expression Expression to extract template name from.
 */
export const extractTemplateNameFromExpression = (expression: string): string | undefined =>
  expression.startsWith('${json(')
    ? expression.match(jsonTemplateNameExtractRegex)?.groups?.templateName?.trim()
    : expression.match(templateNameExtractRegex)?.groups?.templateName?.trim();
