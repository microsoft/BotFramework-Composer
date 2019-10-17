export const NestedFieldNames = {
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

function isLgActivity(activity: string) {
  return activity && activity.includes('bfdactivity-');
}

async function copyLgActivity(activity: string, id: string, lgApi: any): Promise<string> {
  if (!activity) return '';
  if (!isLgActivity(activity) || !lgApi) return activity;

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
    await updateLgTemplate('common', `bfdactivity-${id}`, currentLg.Body);
    return `[bfdactivity-${id}]`;
  }
  return activity;
}

async function overrideExternalReferences(data, externalApi) {
  const { lgApi } = externalApi;

  // Override specific fields different actions care.
  switch (data.$type) {
    case 'Microsoft.SendActivity':
      data.activity = await copyLgActivity(data.activity, data.$designer.id, lgApi);
      break;
  }
}

export async function copyAdaptiveAction(data, externalApi) {
  if (!data || !data.$type) return {};

  const { lgApi, updateDesigner, needsDeepCopy } = externalApi;

  // Deep copy the original data.
  const copy = JSON.parse(JSON.stringify(data));

  // Create copy handler for rewriting fields which need to be handled specially.
  let copyHandler: (data) => any = updateDesigner;

  if (needsDeepCopy(data.$type)) {
    const advancedCopyHandler = async data => {
      updateDesigner(data);
      await overrideExternalReferences(data, { lgApi });
    };
    copyHandler = advancedCopyHandler;
  }

  // Walk action and rewrite needs copy fields
  await walkAdaptiveAction(copy, copyHandler);

  return copy;
}
