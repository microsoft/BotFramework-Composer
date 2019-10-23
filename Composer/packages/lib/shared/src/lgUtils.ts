export const LG_FIELDS = ['prompt', 'unrecognizedPrompt', 'invalidPrompt', 'defaultValueResponse'];

const LgActivityRegex = /\[bfd.+-.+\]/;
export function isLgActivity(activity: string) {
  return activity && LgActivityRegex.test(activity);
}

export async function copyLgActivity(activity: string, newLgId: string, lgApi: any): Promise<string> {
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
    try {
      await updateLgTemplate('common', newLgId, newLgContent);
      return `[${newLgId}]`;
    } catch (e) {
      return newLgContent;
    }
  }
  return activity;
}
