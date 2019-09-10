import { RequestHandler } from 'express';

export interface AuthProvider {
  login: RequestHandler | null;
  authorize: RequestHandler;
}

export interface AuthProviderInit {
  initialize: () => AuthProvider;
}
