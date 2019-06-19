import { LuisConfig } from './../constants';
import storage from './storage';

export const getDefaultLuisConfig = () => {
  return {
    name: storage.get(LuisConfig.PROJECTNAME, ''),
    environment: storage.get(LuisConfig.ENVIRONMENT, ''),
    authoringKey: storage.get(LuisConfig.AUTHORINGKEY, ''),
    authoringRegion: 'westus',
    defaultLanguage: 'en-us',
  };
};
