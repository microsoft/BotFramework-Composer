import { Request, Response } from 'express';
import { authService } from '../services/auth';
import { isElectron } from '../utility/isElectron';

type GetAccessTokenRequest = Request & {
  query: {
    // used for OAuth flow (web)
    clientId?: string;
    // used for OAuth flow (web)
    scopes: string;
    // used for native flow (electron)
    targetResource?: string;
  };
};

async function getAccessToken(req: GetAccessTokenRequest, res: Response) {
  const { clientId, targetResource, scopes = '[]' } = req.query;
  if (isElectron && !targetResource) {
    return res
      .status(400)
      .send('Must pass a "targetResource" parameter to perform authentication in Electron environment.');
  }
  if (!isElectron && !clientId) {
    return res.status(400).send('Must pass a "clientId" parameter to perform authentication in a Web environment.');
  }
  const parsedScopes: string[] = JSON.parse(scopes);

  const accessToken = await authService.getAccessToken({ clientId, targetResource, scopes: parsedScopes });

  res.status(200).json({
    accessToken,
  });
}

export const AuthController = {
  getAccessToken,
};
