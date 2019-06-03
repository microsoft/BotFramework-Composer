import AssectService from '../services/asset';
import { defaultAppInsightClient } from '../appInsight/appInsightClient';

async function getProjTemplates(req: any, res: any) {
  try {
    const templates = await AssectService.manager.getProjectTemplate();
    res.status(200).json(templates);
  } catch (error) {
    defaultAppInsightClient.trackException(new Error('get Project Templates error'));
    res.status(400).json({ error: 'Stop error' });
  }
}

export const AssetController = {
  getProjTemplates: getProjTemplates,
};
