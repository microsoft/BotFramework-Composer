/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
const NestedFieldNames = {
  Actions: 'actions',
  ElseActions: 'elseActions',
  DefaultCase: 'default',
  Cases: 'cases',
};

const DEFAULT_CHILDREN_KEYS = [NestedFieldNames.Actions];
const childrenMap = {
  ['Microsoft.IfCondition']: [NestedFieldNames.Actions, NestedFieldNames.ElseActions],
  ['Microsoft.SwitchCondition']: [NestedFieldNames.Cases, NestedFieldNames.DefaultCase],
};

/**
 * Considering that an Adaptive Action could be nested with other actions,
 * for example, the IfCondition and SwitchCondition and Foreach, we need
 * this helper to visit all possible action nodes recursively.
 *
 * @param {any} input The input Adaptive Action which has $type field.
 * @param {function} visitor The callback function called on each action node.
 */
async function walkAdaptiveAction(input: any, visitor: (data: any) => Promise<any>) {
  if (!input || !input.$type) return;

  await visitor(input);

  let childrenKeys = DEFAULT_CHILDREN_KEYS;
  if (input.$type && childrenMap[input.$type]) {
    childrenKeys = childrenMap[input.$type];
  }

  for (const childrenKey of childrenKeys) {
    const children = input[childrenKey];
    if (Array.isArray(children)) {
      Promise.all(children.map(async x => await walkAdaptiveAction(x, visitor)));
    }
  }
}

const TEMPLATE_PATTERN = /^\[bfd(.+)-(\d+)\]$/;
function isLgTemplate(template: string): boolean {
  return TEMPLATE_PATTERN.test(template);
}

function parseLgTemplate(template: string) {
  const result = TEMPLATE_PATTERN.exec(template);
  if (result && result.length === 3) {
    return {
      templateType: result[1],
      templateId: result[2],
    };
  }
  return null;
}

async function copyLgActivity(activity: string, designerId: string, lgApi: any): Promise<string> {
  if (!activity) return '';
  if (!lgApi) return activity;

  const lgTemplate = parseLgTemplate(activity);
  if (!lgTemplate) return activity;

  const { templateType } = lgTemplate;
  const { getLgTemplates, updateLgTemplate } = lgApi;
  if (!getLgTemplates) return activity;

  let rawLg: any[] = [];
  try {
    rawLg = await getLgTemplates('common', activity);
  } catch (error) {
    return activity;
  }

  const currentLg = rawLg.find(lg => `[${lg.Name}]` === activity);

  if (currentLg) {
    // Create new lg activity.
    const newLgContent = currentLg.Body;
    const newLgId = `bfd${templateType}-${designerId}`;
    try {
      await updateLgTemplate('common', newLgId, newLgContent);
      return `[${newLgId}]`;
    } catch (e) {
      return newLgContent;
    }
  }
  return activity;
}

const overrideLgActivity = async (data, { lgApi }) => {
  data.activity = await copyLgActivity(data.activity, data.$designer.id, lgApi);
};

const overrideLgPrompt = async (data, { lgApi }) => {
  const promptFields = ['prompt', 'unrecognizedPrompt', 'defaultValueResponse', 'invalidPrompt'];
  for (const field of promptFields) {
    if (isLgTemplate(data[field])) {
      data[field] = await copyLgActivity(data[field], data.$designer.id, lgApi);
    }
  }
};

// TODO: use $type from SDKTypes (after solving circular import issue).
const OverriderByType = {
  'Microsoft.SendActivity': overrideLgActivity,
  'Microsoft.AttachmentInput': overrideLgPrompt,
  'Microsoft.ConfirmInput': overrideLgPrompt,
  'Microsoft.DateTimeInput': overrideLgPrompt,
  'Microsoft.NumberInput': overrideLgPrompt,
  'Microsoft.OAuthInput': overrideLgPrompt,
  'Microsoft.TextInput': overrideLgPrompt,
  'Microsoft.ChoiceInput': overrideLgPrompt,
};

const needsOverride = data => !!(data && OverriderByType[data.$type]);

export async function copyAdaptiveAction(data, externalApi) {
  if (!data || !data.$type) return {};

  // Deep copy the original data.
  const copy = JSON.parse(JSON.stringify(data));

  const { updateDesigner } = externalApi;
  // Create copy handler for rewriting fields which need to be handled specially.
  const copyHandler = async data => {
    updateDesigner(data);
    if (needsOverride(data)) {
      const overrider = OverriderByType[data.$type];
      await overrider(data, externalApi);
    }
  };

  // Walk action and rewrite needs copy fields
  await walkAdaptiveAction(copy, copyHandler);

  return copy;
}
