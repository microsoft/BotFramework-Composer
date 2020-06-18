import { ComposerGlobalName } from '../common/constants';
import { OAuthOptions } from './types';

export function login(options: OAuthOptions): Promise<string> {
  return window[ComposerGlobalName].login(options);
}

export function getAccessToken(options: OAuthOptions): Promise<string> {
  return window[ComposerGlobalName].getAccessToken(options);
}
