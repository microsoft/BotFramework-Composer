import AssectService from '../services/asset';
import { AssertError } from '../models/serverError/serverError';
async function getProjTemplates(req: any, res: any) {
  try {
    const templates = await AssectService.manager.getProjectTemplate();
    res.status(200).json(templates);
  } catch (error) {
    res.status(400).json(
      new AssertError({
        title: 'Get templates Error',
        statusCode: 400,
        message: error instanceof Error ? error.message : error,
      })
    );
  }
}

export const AssetController = {
  getProjTemplates: getProjTemplates,
};
