import { LuisConfig } from './../constants';
import storage from './storage';

export const getDefaultLuisConfig = () => {
  return {
    [LuisConfig.PROJECTNAME]: storage.get(LuisConfig.PROJECTNAME, ''),
    [LuisConfig.ENVIRONMENT]: storage.get(LuisConfig.ENVIRONMENT, ''),
    [LuisConfig.AUTHORINGKEY]: storage.get(LuisConfig.AUTHORINGKEY, ''),
    authoringRegion: 'westus',
    defaultLanguage: 'en-us',
  };
};
