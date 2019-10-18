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

function isLgActivity(activity: string) {
  return activity && (activity.includes('bfdactivity-') || activity.includes('bfdprompt-'));
}

async function copyLgActivity(activity: string, designerId: string, lgApi: any): Promise<string> {
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
    // Create new lg activity.
    const newLgContent = currentLg.Body;
    const newLgId = `bfdactivity-${designerId}`;
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
  data.prompt = await copyLgActivity(data.prompt, data.$designer.id, lgApi);
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
