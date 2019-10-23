import cloneDeep from 'lodash.clonedeep';

import { walkAdaptiveAction } from './walkAdaptiveAction';

const overrideLgActivity = async (data, { copyLgTemplate }) => {
  const newLgId = `[bfdactivity-${data.$designer.id}]`;
  data.activity = await copyLgTemplate(data.activity, newLgId);
};

const LG_FIELDS = ['prompt', 'unrecognizedPrompt', 'invalidPrompt', 'defaultValueResponse'];
const overrideLgPrompt = async (data, { copyLgTemplate }) => {
  for (const promptFieldKey of LG_FIELDS) {
    const existingActivity = data[promptFieldKey];
    const newLgId = `[bfd${promptFieldKey}-${data.$designer.id}]`;
    if (existingActivity) {
      data[promptFieldKey] = await copyLgTemplate(existingActivity, newLgId);
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

export async function copyAdaptiveAction(data, externalApi: { updateDesigner: Function; copyLgTemplate: Function }) {
  if (!data || !data.$type) return {};

  const copy = cloneDeep(data);

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
