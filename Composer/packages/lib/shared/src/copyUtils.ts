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
  return activity && (activity.includes('bfdactivity-') || activity.includes('bfdprompt-'));
}

async function copyLgActivity(activity: string, lgApi: any): Promise<string> {
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

// TODO: use $type from SDKTypes (after solving circular import issue).
const OverriderByType = {
  'Microsoft.SendActivity': async (data, { lgApi }) => {
    data.activity = await copyLgActivity(data.activity, lgApi);
  },
  'Microsoft.AttachmentInput': async (data, { lgApi }) => {
    data.prompt = await copyLgActivity(data.prompt, lgApi);
  },
  'Microsoft.ConfirmInput': async (data, { lgApi }) => {
    data.prompt = await copyLgActivity(data.prompt, lgApi);
  },
  'Microsoft.DateTimeInput': async (data, { lgApi }) => {
    data.prompt = await copyLgActivity(data.prompt, lgApi);
  },
  'Microsoft.NumberInput': async (data, { lgApi }) => {
    data.prompt = await copyLgActivity(data.prompt, lgApi);
  },
  'Microsoft.OAuthInput': async (data, { lgApi }) => {
    data.prompt = await copyLgActivity(data.prompt, lgApi);
  },
  'Microsoft.TextInput': async (data, { lgApi }) => {
    data.prompt = await copyLgActivity(data.prompt, lgApi);
  },
  'Microsoft.ChoiceInput': async (data, { lgApi }) => {
    data.prompt = await copyLgActivity(data.prompt, lgApi);
  },
};

const needsDeepCopy = data => !!(data && OverriderByType[data.$type]);

export async function copyAdaptiveAction(data, externalApi) {
  if (!data || !data.$type) return {};

  const { updateDesigner } = externalApi;

  // Deep copy the original data.
  const copy = JSON.parse(JSON.stringify(data));

  // Create copy handler for rewriting fields which need to be handled specially.
  let copyHandler: (data) => any = updateDesigner;

  if (needsDeepCopy(data.$type)) {
    const advancedCopyHandler = async data => {
      updateDesigner(data);
      if (OverriderByType[data.$type]) {
        const overrider = OverriderByType[data.$type];
        await overrider(data, externalApi);
      }
    };
    copyHandler = advancedCopyHandler;
  }

  // Walk action and rewrite needs copy fields
  await walkAdaptiveAction(copy, copyHandler);

  return copy;
}
