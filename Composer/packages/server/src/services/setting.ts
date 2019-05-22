import settings from '../settings/settings.json';
import { Path } from '../utility/path.js';

class SettingService {
  getSettings() {
    settings.defaultLocation.path = Path.resolve(settings.defaultLocation.path);
    return settings;
  }
}

const service = new SettingService();
export default service;
