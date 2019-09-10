import { AuthProvider, AuthProviderInit } from './types';
import absh from './absh';

const defaultProvider: AuthProvider = {
  login: null,
  authorize: (req, res, next) => next(),
};

const PROVIDERS = new Map<string, AuthProviderInit>();
PROVIDERS.set('abs-h', absh);

export function getAuthProvider(): AuthProvider {
  const { COMPOSER_AUTH_PROVIDER } = process.env;
  let provider: AuthProvider = defaultProvider;

  if (COMPOSER_AUTH_PROVIDER) {
    const authProvider = PROVIDERS.get(COMPOSER_AUTH_PROVIDER);
    if (authProvider) {
      provider = authProvider.initialize();
    }
  }

  return provider;
}
