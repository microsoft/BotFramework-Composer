import AssectService from '../services/asset';

async function getProjTemplates(req: any, res: any) {
  try {
    const templates = await AssectService.manager.getProjectTemplate();
    res.status(200).json(templates);
  } catch (error) {
    res.status(400).json({ error: 'Stop error' });
  }
}

export const AssetController = {
  getProjTemplates: getProjTemplates,
};
