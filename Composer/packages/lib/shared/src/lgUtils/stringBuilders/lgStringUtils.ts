/* eslint-disable security/detect-unsafe-regex */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type TemplateBodyItem = {
  kind: 'newline' | 'variation' | 'comment';
  value: string;
};

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

const splitRegex = /\r?\n(?=-|>|\r?\n)/g;
export const parseTemplateBody = (body?: string): TemplateBodyItem[] => {
  /**
   * Split by newline followed by either another new line, or new variation or a comment
   */
  const items = body?.replace(/\r?\n$/g, '')?.split(splitRegex) ?? [];

  let multiLineItem = '';
  const fixedItems: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (multiLineItem || item.startsWith('-')) {
      if (/^-( )*```/.test(item)) {
        multiLineItem = item;
        if(/```$/.test(item)) {
          fixedItems.push(multiLineItem);
          multiLineItem = '';
        } else {
          multiLineItem += '\n';
        }
        continue;
      }

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
