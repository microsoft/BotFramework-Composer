import SettingService from '../services/setting';

async function getSettings(req: any, res: any) {
  try {
    const settings = await SettingService.getSettings();
    res.status(200).json(settings);
  } catch (error) {
    res.status(400).json({ error: 'setting is not found' });
  }
}

export const SettingController = {
  getSettings: getSettings,
};
