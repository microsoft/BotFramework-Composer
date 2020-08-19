import { combineReducers } from 'redux';
import { IAppState } from './models/reduxState';
import { NavReducer as NavState } from './packages/app/reducers/navReducer';
import { WebChatReducer as WebChatState } from './packages/webchatEditor/reducers/webChatReducer';
import { CreationExperienceReducer as CreationState } from './packages/creationExperience/reducers/creationExperienceReducer';

export const reducers = combineReducers<IAppState>({
  NavState,
  WebChatState,
  CreationState,
});
