export const LG_FIELDS = ['prompt', 'unrecognizedPrompt', 'invalidPrompt', 'defaultValueResponse'];

const TEMPLATE_PATTERN = /^\[(bfd.+-\d+)\]$/;
export function isLgActivity(activity: string) {
  return activity && TEMPLATE_PATTERN.test(activity);
}

export async function copyLgTemplate(
  lgFileName: string,
  templateNameToCopy: string,
  newTemplateName: string,
  lgApi: any
): Promise<string> {
  if (!templateNameToCopy) return '';
  if (!isLgActivity(templateNameToCopy) || !lgApi) return templateNameToCopy;

  const { getLgTemplates, updateLgTemplate } = lgApi;
  if (!getLgTemplates) return templateNameToCopy;

  let rawLg: any[] = [];
  try {
    rawLg = await getLgTemplates(lgFileName, templateNameToCopy);
  } catch (error) {
    return templateNameToCopy;
  }

  const currentLg = rawLg.find(lg => `[${lg.Name}]` === templateNameToCopy);

  if (currentLg) {
    // Create new lg activity.
    const newLgContent = currentLg.Body;
    try {
      await updateLgTemplate(lgFileName, newTemplateName, newLgContent);
      return `[${newTemplateName}]`;
    } catch (e) {
      return newLgContent;
    }
  }
  return templateNameToCopy;
}
