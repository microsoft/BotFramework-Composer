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
export async function visitAdaptiveAction(input: any, visitor: (data: any) => Promise<any>) {
  if (!input || !input.$type) return;

  await visitor(input);

  let childrenKeys = DEFAULT_CHILDREN_KEYS;
  if (input.$type && childrenMap[input.$type]) {
    childrenKeys = childrenMap[input.$type];
  }

  for (const childrenKey of childrenKeys) {
    const children = input[childrenKey];
    if (Array.isArray(children)) {
      Promise.all(children.map(async x => await visitAdaptiveAction(x, visitor)));
    }
  }
}

function isLgActivity(activity: string) {
  return activity && activity.includes('bfdactivity-');
}

export async function copyLgActivity(activity: string, lgApi: any): Promise<string> {
  if (!activity) return '';
  if (!isLgActivity(activity) || !lgApi) return activity;

  const { getLgTemplates } = lgApi;
  if (!getLgTemplates) return activity;

  let rawLg: any[] = [];
  try {
    rawLg = await getLgTemplates('common', activity);
  } catch (error) {
    return activity;
  }

  const currentLg = rawLg.find(lg => `[${lg.Name}]` === activity);

  if (currentLg) return currentLg.Body;
  return activity;
}
