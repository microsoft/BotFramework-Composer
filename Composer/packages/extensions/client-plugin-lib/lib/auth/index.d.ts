import { OAuthOptions } from './types';
/** Logs the user into Azure for a given client ID with the provided scopes. Returns an ID token. */
export declare function login(options: OAuthOptions): Promise<string>;
/** Requests an access token from Azure for a given client ID with the provided scopes.
 *  Returns an access token that can be used to call APIs on behalf of the user.
 *
 */
export declare function getAccessToken(options: OAuthOptions): Promise<string>;
//# sourceMappingURL=index.d.ts.map
